/// <reference types="vite/client" />
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, AlertCircle, Bell, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import BookingModal from "./BookingModal";
import SOSModal from "./SOSModal";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

import { riderAuth, db } from "./figma/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";

const containerStyle = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  ],
};

export default function RiderInterface() {
  const navigate = useNavigate();
  const [isOnRoad, setIsOnRoad] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [position, setPosition] = useState({ lat: 14.317986, lng: 121.112499 });
  const [riderData, setRiderData] = useState({ name: "Rider", id: "" });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
  });

  const getAddressFromCoords = useCallback(async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve) => {
      if (!window.google) return resolve("Locating...");
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const address = results[0].formatted_address.split(',')[0];
          const city = results[0].address_components.find(c => c.types.includes("locality"))?.long_name;
          resolve(`${address}${city ? `, ${city}` : ""}`);
        } else {
          resolve("Santa Rosa, Laguna");
        }
      });
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(riderAuth, async (user) => {
      if (!user) {
        setAuthReady(true);
        setAuthed(false);
        navigate("/riderlogin", { replace: true });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data()?.role?.trim() === "rider") {
          setRiderData({
            name: userDoc.data().name || "Rider",
            id: user.uid
          });

          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) setIsOnRoad(snap.data().status === "on-road");
          setAuthed(true);
        } else {
          await signOut(riderAuth);
          setAuthed(false);
          navigate("/riderlogin", { replace: true });
        }
      } catch (err: any) {
        await signOut(riderAuth);
        navigate("/riderlogin", { replace: true });
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // GPS WATCH LOGIC: Eto ang nag-uupdate ng location habang gumagalaw
  useEffect(() => {
    if (!authed || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);

        const user = riderAuth.currentUser;
        if (user && isOnRoad) {
          const readableAddress = await getAddressFromCoords(newPos.lat, newPos.lng);

          // Update Users Collection (For Admin Map)
          await updateDoc(doc(db, "users", user.uid), {
            location: newPos,
            currentAddress: readableAddress,
            lastUpdated: serverTimestamp()
          });

          // Update Attendance Collection
          updateDoc(doc(db, "attendance", user.uid), {
            latitude: newPos.lat,
            longitude: newPos.lng,
            location: readableAddress,
            timestamp: serverTimestamp(),
          }).catch(err => console.error("Sync Error:", err));
        }
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [authed, isOnRoad, getAddressFromCoords]);

  const handleStatusToggle = async (status: boolean) => {
    const user = riderAuth.currentUser;
    if (!user) return;
    setIsOnRoad(status);
    try {
      const currentAddress = status ? await getAddressFromCoords(position.lat, position.lng) : "Offline";

      await updateDoc(doc(db, "users", user.uid), {
        status: status ? "on-road" : "off-road",
        location: position,
        currentAddress: currentAddress
      });

      await setDoc(doc(db, "attendance", user.uid), {
        riderName: riderData.name,
        riderId: riderData.id,
        email: user.email || "",
        status: status ? "Active" : "Offline",
        location: currentAddress,
        latitude: position.lat,
        longitude: position.lng,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Toggle Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const user = riderAuth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { status: "off-road" });
      }
      await signOut(riderAuth);
      navigate("/riderlogin", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (!authReady) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Loading...</div>;
  if (!authed) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col pb-24" style={{ backgroundColor: "#0B0B0C" }}>
      <header className="border-b border-white/10 p-4 sticky top-0 z-50 bg-[#0B0B0C]/80 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h2 className="text-white font-bold">{riderData.name} Dashboard</h2>
            <p className="text-white/60 text-sm">ID: {riderData.id.substring(0, 8)}...</p>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto p-4 space-y-6">
        <div className="rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur-xl">
          <h3 className="text-white mb-4 text-center font-medium">Duty Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleStatusToggle(true)}
              className={`h-20 text-white border-0 transition-all ${isOnRoad ? "ring-2 ring-green-400 scale-[1.02]" : "opacity-40"}`}
              style={{ background: "linear-gradient(135deg,#10b981 0%,#34d399 100%)" }}>
              <div className="font-bold">On Road</div>
            </Button>
            <Button onClick={() => handleStatusToggle(false)}
              className={`h-20 text-white border-0 transition-all ${!isOnRoad ? "ring-2 ring-red-400 scale-[1.02]" : "opacity-40"}`}
              style={{ background: "linear-gradient(135deg,#ef4444 0%,#f87171 100%)" }}>
              <div className="font-bold">Off Road</div>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl h-[40vh]">
          {isLoaded ? (
            <GoogleMap mapContainerStyle={containerStyle} center={position} zoom={16} options={mapOptions}>
              <Marker position={position} />
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 italic">Loading Maps...</div>
          )}
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnRoad ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
            <div className="text-xs">
              <p className="text-white/60 uppercase tracking-tighter">Live GPS Tracking</p>
              <p className="text-white font-medium">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => isOnRoad && setShowBookingModal(true)} disabled={!isOnRoad}
            className="h-16 text-white border-0 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#C13584 0%,#FCAF45 100%)" }}>
            <Bell className="w-5 h-5 mr-2" /> Requests
          </Button>
          <Button onClick={() => setShowSOSModal(true)} className="h-16 text-white border-0"
            style={{ background: "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)" }}>
            <AlertCircle className="w-5 h-5 mr-2" /> SOS
          </Button>
        </div>
      </main>

      {showBookingModal && <BookingModal onClose={() => setShowBookingModal(false)} />}
      {showSOSModal && <SOSModal onClose={() => setShowSOSModal(false)} />}
    </div>
  );
}