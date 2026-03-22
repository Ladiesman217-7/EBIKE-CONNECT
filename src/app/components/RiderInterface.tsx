///<reference types="vite/client" />
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, AlertCircle, Bell, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import BookingModal from "./BookingModal";
import SOSModal from "./SOSModal";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { auth, db } from "./figma/firebase";
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
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Real-time location state
  const [position, setPosition] = useState({ lat: 14.317986, lng: 121.112499 });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve) => {
      if (!window.google) return resolve("Locating...");
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const parts = results[0].address_components;
          const neighborhood = parts.find(p => p.types.includes("neighborhood"))?.long_name;
          const sublocality = parts.find(p => p.types.includes("sublocality"))?.long_name;
          const city = parts.find(p => p.types.includes("locality"))?.long_name;
          resolve(neighborhood || sublocality ? `${neighborhood || sublocality}, ${city}` : city || "Unknown Area");
        } else {
          resolve("Santa Rosa, Laguna");
        }
      });
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);

        // PINALITAN: riderAuth -> auth
        const user = auth.currentUser;
        if (user && isOnRoad) {
          const readableAddress = await getAddressFromCoords(newPos.lat, newPos.lng);
          const attendanceRef = doc(db, "attendance", user.uid);
          updateDoc(attendanceRef, {
            latitude: newPos.lat,
            longitude: newPos.lng,
            location: readableAddress,
            timestamp: serverTimestamp(),
          }).catch(err => console.error("GPS Sync Error:", err));
        }
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnRoad]);

  useEffect(() => {
    // PINALITAN: riderAuth -> auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoadingAuth(false);
        navigate("/rider");
        return;
      }
      try {
        const attendanceRef = doc(db, "attendance", user.uid);
        const snap = await getDoc(attendanceRef);
        if (snap.exists()) {
          setIsOnRoad(snap.data().status === "Active");
        }
      } finally {
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleStatusToggle = async (status: boolean) => {
    // PINALITAN: riderAuth -> auth
    const user = auth.currentUser;
    if (!user) return;

    setIsOnRoad(status);

    try {
      const currentAddress = status
        ? await getAddressFromCoords(position.lat, position.lng)
        : "Offline";

      await setDoc(doc(db, "attendance", user.uid), {
        riderName: user.displayName || "Mark Cabrales",
        email: user.email || "",
        status: status ? "Active" : "Offline",
        location: currentAddress,
        latitude: position.lat,
        longitude: position.lng,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // PINALITAN: riderAuth -> auth
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "attendance", user.uid), { status: "Offline" });
      }
      await signOut(auth);
      navigate("/rider");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loadingAuth) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col pb-24" style={{ backgroundColor: "#0B0B0C" }}>
      <header className="border-b border-white/10 p-4 sticky top-0 z-50 bg-[#0B0B0C]/80 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h2 className="text-white font-bold">Rider Dashboard</h2>
            <p className="text-white/60 text-sm">Santa Rosa Branch</p>
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
            <Button
              onClick={() => handleStatusToggle(true)}
              className={`h-20 text-white border-0 transition-all ${isOnRoad ? "ring-2 ring-green-400 scale-[1.02]" : "opacity-40"}`}
              style={{ background: "linear-gradient(135deg,#10b981 0%,#34d399 100%)" }}
            >
              <div className="font-bold">On Road</div>
            </Button>
            <Button
              onClick={() => handleStatusToggle(false)}
              className={`h-20 text-white border-0 transition-all ${!isOnRoad ? "ring-2 ring-red-400 scale-[1.02]" : "opacity-40"}`}
              style={{ background: "linear-gradient(135deg,#ef4444 0%,#f87171 100%)" }}
            >
              <div className="font-bold">Off Road</div>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl h-[40vh] sm:h-[300px]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={position}
              zoom={16}
              options={mapOptions}
            >
              <Marker position={position} />
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 italic">Loading Maps...</div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnRoad ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
            <div className="text-xs">
              <p className="text-white/60 uppercase tracking-tighter">Live GPS Tracking</p>
              <p className="text-white font-medium truncate">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-2 gap-4">
          <Button
            onClick={() => isOnRoad && setShowBookingModal(true)}
            disabled={!isOnRoad}
            className="h-16 text-white border-0 disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#C13584 0%,#FCAF45 100%)" }}
          >
            <Bell className="w-5 h-5 mr-2" /> Requests
          </Button>

          <Button
            onClick={() => setShowSOSModal(true)}
            className="h-16 text-white border-0"
            style={{ background: "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)" }}
          >
            <AlertCircle className="w-5 h-5 mr-2" /> SOS
          </Button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0B0C]/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 pb-safe z-50 sm:hidden">
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center gap-1 text-green-400">
            <MapPin className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Map</span>
          </button>

          <button
            onClick={() => isOnRoad && setShowBookingModal(true)}
            disabled={!isOnRoad}
            className={`flex flex-col items-center gap-1 ${isOnRoad ? "text-white/60" : "text-white/20"}`}
          >
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Requests</span>
          </button>

          <button
            onClick={() => setShowSOSModal(true)}
            className="flex flex-col items-center gap-1 text-red-500"
          >
            <AlertCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">SOS</span>
          </button>
        </div>
      </nav>

      {showBookingModal && <BookingModal onClose={() => setShowBookingModal(false)} />}
      {showSOSModal && <SOSModal onClose={() => setShowSOSModal(false)} />}
    </div>
  );
}