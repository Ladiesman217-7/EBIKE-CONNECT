/// <reference types="vite/client" />
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./figma/firebase.js";
import {
  AlertCircle,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  Phone,
  Settings,
  ChevronRight,
  Camera,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { Button } from "./ui/button";
import BookingModal from "./BookingModal";
import SOSModal from "./SOSModal";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

import { riderAuth, riderDb } from "./figma/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isOnRoad, setIsOnRoad] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Assignment notification
  const [assignmentNotif, setAssignmentNotif] = useState<string | null>(null);
  const prevRiderType = useRef<string | null>(null);

  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: 14.317986, lng: 121.112499 });
  const [riderData, setRiderData] = useState({
    name: "Rider",
    id: "",
    phone: "",
    photoUrl: "",
    riderType: "Regular" as "Regular" | "Miner",
  });

  const [lastPos, setLastPos] = useState<{ lat: number; lng: number } | null>(null);
  const [lastMovedTime, setLastMovedTime] = useState<number>(Date.now());

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
  });

  // Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const user = riderAuth.currentUser;
    if (!file || !user) return;
    try {
      const storageRef = ref(storage, `profile_pics/${user.uid}/rider_profile.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(riderDb, "users", user.uid), { photoUrl: downloadURL });
      setRiderData(prev => ({ ...prev, photoUrl: downloadURL }));
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image.");
    }
  };

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
          resolve("Searching location...");
        }
      });
    });
  }, []);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(riderAuth, async (user) => {
      if (!user) {
        setAuthReady(true);
        setAuthed(false);
        navigate("/riderlogin", { replace: true });
        return;
      }
      try {
        const userDoc = await getDoc(doc(riderDb, "users", user.uid));
        if (userDoc.exists() && userDoc.data()?.role?.trim() === "rider") {
          const userData = userDoc.data();
          const type = userData.riderType === "Miner" ? "Miner" : "Regular";
          prevRiderType.current = type;
          setRiderData({
            name: userData.name || "Rider",
            id: user.uid,
            phone: userData.phone || "No Number",
            photoUrl: userData.photoUrl || "",
            riderType: type,
          });
          setIsOnRoad(userData.status === "active" || userData.status === "idle");
          setAuthed(true);
        } else {
          await signOut(riderAuth);
          navigate("/riderlogin", { replace: true });
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        navigate("/riderlogin", { replace: true });
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Real-time listener for riderType changes from admin
  useEffect(() => {
    const user = riderAuth.currentUser;
    if (!authed || !user) return;

    const unsub = onSnapshot(doc(riderDb, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const newType: "Regular" | "Miner" = data.riderType === "Miner" ? "Miner" : "Regular";

      // Show notification only if type actually changed after initial load
      if (prevRiderType.current !== null && prevRiderType.current !== newType) {
        setAssignmentNotif(newType);
        setTimeout(() => setAssignmentNotif(null), 5000);
      }
      prevRiderType.current = newType;
      setRiderData(prev => ({ ...prev, riderType: newType }));
    });

    return () => unsub();
  }, [authed]);

  // Idle timer
  useEffect(() => {
    if (!isOnRoad || !authed) return;
    const interval = setInterval(async () => {
      const elapsed = (Date.now() - lastMovedTime) / 1000 / 60;
      if (elapsed >= 15) {
        const user = riderAuth.currentUser;
        if (user) {
          await updateDoc(doc(riderDb, "users", user.uid), { status: "idle" });
          await setDoc(doc(riderDb, "attendance", user.uid), { status: "Idle" }, { merge: true });
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isOnRoad, authed, lastMovedTime]);

  // GPS tracking
  useEffect(() => {
    if (!authed || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        if (mapRef.current) mapRef.current.panTo(newPos);
        const user = riderAuth.currentUser;
        if (user && isOnRoad) {
          const hasMoved = lastPos === null ||
            newPos.lat.toFixed(6) !== lastPos.lat.toFixed(6) ||
            newPos.lng.toFixed(6) !== lastPos.lng.toFixed(6);
          if (hasMoved) {
            setLastMovedTime(Date.now());
            setLastPos(newPos);
            const readableAddress = await getAddressFromCoords(newPos.lat, newPos.lng);
            await updateDoc(doc(riderDb, "users", user.uid), {
              location: newPos, latitude: newPos.lat, longitude: newPos.lng,
              currentAddress: readableAddress, status: "active", lastMoved: serverTimestamp()
            });
            await setDoc(doc(riderDb, "attendance", user.uid), {
              riderName: riderData.name, riderId: user.uid, status: "Active",
              latitude: newPos.lat, longitude: newPos.lng,
              location: readableAddress, timestamp: serverTimestamp()
            }, { merge: true });
          }
        }
      },
      (err) => {
        console.error("GPS Error:", err.message);
        if (err.code === 1) alert("Please allow location access.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [authed, isOnRoad, getAddressFromCoords, riderData.name, lastPos]);

  const handleStatusToggle = async (status: boolean) => {
    const user = riderAuth.currentUser;
    if (!user) return;
    setIsOnRoad(status);
    try {
      const currentAddress = status ? await getAddressFromCoords(position.lat, position.lng) : "Offline";
      await updateDoc(doc(riderDb, "users", user.uid), {
        status: status ? "active" : "offline",
        location: position, latitude: position.lat, longitude: position.lng,
        currentAddress, lastMoved: serverTimestamp()
      });
      await setDoc(doc(riderDb, "attendance", user.uid), {
        status: status ? "Active" : "Offline", timestamp: serverTimestamp(),
      }, { merge: true });
      if (status) setLastMovedTime(Date.now());
    } catch (error) {
      console.error("Status Toggle Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const user = riderAuth.currentUser;
      if (user) await updateDoc(doc(riderDb, "users", user.uid), { status: "offline" });
      await signOut(riderAuth);
      navigate("/riderlogin", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (!authReady) return <div className="min-h-screen flex items-center justify-center text-white bg-black italic">Verifying Rider...</div>;
  if (!authed) return null;

  const isMiner = riderData.riderType === "Miner";

  return (
    <div className="min-h-[100dvh] flex flex-col pb-24 relative overflow-x-hidden" style={{ backgroundColor: "#0B0B0C" }}>

      {/* Assignment Notification Banner */}
      {assignmentNotif && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all animate-bounce
          ${assignmentNotif === "Miner"
            ? "bg-purple-600/90 border-purple-400/50 text-white"
            : "bg-blue-600/90 border-blue-400/50 text-white"
          }`}>
          {assignmentNotif === "Miner"
            ? <ShieldCheck className="w-5 h-5" />
            : <ShieldOff className="w-5 h-5" />
          }
          <div>
            <p className="font-bold text-sm">Assignment Updated!</p>
            <p className="text-xs opacity-80">
              {assignmentNotif === "Miner"
                ? "You are now a Miner — Booking requests enabled!"
                : "You are now Regular — Booking requests disabled."}
            </p>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-[#121214] z-[101] transform transition-transform duration-300 border-r border-white/10 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white font-bold text-lg">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          {/* Profile */}
          <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/5">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/50 overflow-hidden flex items-center justify-center">
                  {riderData.photoUrl
                    ? <img src={riderData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    : <User className="w-10 h-10 text-blue-400/50" />
                  }
                </div>
                <input type="file" id="profile-pic-input" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <label htmlFor="profile-pic-input" className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full border-2 border-[#121214] cursor-pointer hover:bg-blue-700">
                  <Camera className="w-3 h-3 text-white" />
                </label>
              </div>
              <h3 className="text-white font-bold text-center">{riderData.name}</h3>
              <p className="text-white/20 text-[10px] uppercase tracking-widest mt-1">Verified Rider</p>

              {/* Rider Type Badge in Sidebar */}
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1
                ${isMiner ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                {isMiner ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                {riderData.riderType}
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <button className="w-full flex items-center justify-between p-4 text-white/70 hover:bg-white/5 rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-sm">Mobile: {riderData.phone}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </button>
            <button className="w-full flex items-center justify-between p-4 text-white/70 hover:bg-white/5 rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-sm">Account Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </button>
          </nav>

          <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-auto">
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm">Log Out</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 p-4 sticky top-0 z-50 bg-[#0B0B0C]/80 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg border border-white/5">
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white font-bold">{riderData.name}</h3>
              <div className="flex items-center gap-1">
                <p className="text-white/40 text-[10px] tracking-widest uppercase font-bold">Rider Dashboard</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1
                  ${isMiner ? "bg-purple-500/30 text-purple-300" : "bg-blue-500/30 text-blue-300"}`}>
                  {riderData.riderType}
                </span>
              </div>
            </div>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/20">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto p-4 space-y-6">
        {/* Status Toggle */}
        <div className="rounded-2xl border border-white/10 p-6 bg-white/5 backdrop-blur-xl shadow-inner">
          <h3 className="text-white mb-4 text-center font-medium">Switch Duty Mode</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleStatusToggle(true)}
              className={`h-20 text-white border-0 transition-all ${isOnRoad ? "ring-2 ring-green-400 scale-[1.02]" : "opacity-40"}`}
              style={{ background: "linear-gradient(135deg,#10b981 0%,#34d399 100%)" }}>
              <div className="font-bold uppercase tracking-wider">ON ROAD</div>
            </Button>
            <Button onClick={() => handleStatusToggle(false)}
              className={`h-20 text-white border-0 transition-all ${!isOnRoad ? "ring-2 ring-red-400 scale-[1.02]" : "opacity-40"}`}
              style={{ background: "linear-gradient(135deg,#ef4444 0%,#f87171 100%)" }}>
              <div className="font-bold uppercase tracking-wider">OFF ROAD</div>
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl h-[45vh]">
          {isLoaded ? (
            <GoogleMap mapContainerStyle={containerStyle} center={position} zoom={17} options={mapOptions}
              onLoad={(map) => { mapRef.current = map; }}>
              <Marker position={position} />
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-white/20 animate-pulse bg-white/5">Initializing Map...</div>
          )}
          <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isOnRoad ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            <div className="flex-1">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Live GPS Pinpoint</p>
              <p className="text-white font-mono text-sm">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons — Requests only for Miner */}
        <div className={`grid gap-4 ${isMiner ? "grid-cols-2" : "grid-cols-1"}`}>
          {isMiner && (
            <Button
              onClick={() => isOnRoad && setShowBookingModal(true)}
              disabled={!isOnRoad}
              className="h-16 text-white border-0 disabled:opacity-30 shadow-lg"
              style={{ background: "linear-gradient(135deg,#C13584 0%,#FCAF45 100%)" }}
            >
              <Bell className="w-5 h-5 mr-2" /> Requests
            </Button>
          )}
          <Button
            onClick={() => setShowSOSModal(true)}
            className="h-16 text-white border-0 shadow-lg"
            style={{ background: "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)" }}
          >
            <AlertCircle className="w-5 h-5 mr-2" /> SOS
          </Button>
        </div>

        {/* Info message for Regular riders */}
        {!isMiner && (
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center gap-3">
            <ShieldOff className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-blue-300 text-sm">
              You are a <strong>Regular</strong> rider. Booking requests are available for <strong>Miner</strong> riders only.
            </p>
          </div>
        )}
      </main>

      {showBookingModal && <BookingModal onClose={() => setShowBookingModal(false)} />}
      {showSOSModal && <SOSModal onClose={() => setShowSOSModal(false)} />}
    </div>
  );
}