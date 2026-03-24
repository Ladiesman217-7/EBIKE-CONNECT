import { useState, useEffect } from "react";
import { Navigation } from "lucide-react";
import { Badge } from "./ui/badge";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

import { adminDb } from "./figma/firebase.js";
import { collection, onSnapshot } from "firebase/firestore";

interface RiderLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  status: string;
}

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 14.317986, lng: 121.112499 };

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  ],
};

export default function MapSection() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const [riders, setRiders] = useState<RiderLocation[]>([]);
  const [selectedRider, setSelectedRider] = useState<RiderLocation | null>(null);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    // FIX: query "attendance" collection, not "users"
    const unsubscribe = onSnapshot(collection(adminDb, "attendance"), (snapshot) => {
      const activeRiders: RiderLocation[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const lat = Number(data.latitude);
          const lng = Number(data.longitude);
          return {
            id: doc.id,
            name: String(data.riderName || data.name || "Unknown Rider"),
            lat,
            lng,
            address: String(data.location || "No Address"),
            status: String(data.status || "Offline"),
          };
        })
        .filter((rider) =>
          rider.status === "Active" &&
          !isNaN(rider.lat) &&
          !isNaN(rider.lng) &&
          rider.lat !== 0 &&
          rider.lng !== 0
        );

      setRiders(activeRiders);
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleRiderClick = (rider: RiderLocation) => {
    setSelectedRider(rider);
    setZoom(17);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-2">Live GPS Tracking</h1>
        <p className="text-white/60">Monitoring {riders.length} active riders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div
          className="lg:col-span-2 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl bg-slate-900"
          style={{ height: "600px" }}
        >
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={
                selectedRider
                  ? { lat: selectedRider.lat, lng: selectedRider.lng }
                  : defaultCenter
              }
              zoom={zoom}
              options={mapOptions}
            >
              {riders.map((rider) => (
                <Marker
                  key={rider.id}
                  position={{ lat: rider.lat, lng: rider.lng }}
                  onClick={() => handleRiderClick(rider)}
                  title={rider.name}
                />
              ))}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              Loading Maps...
            </div>
          )}
        </div>

        {/* Riders List */}
        <div
          className="rounded-2xl border border-white/10 p-6 overflow-y-auto bg-white/5"
          style={{ height: "600px" }}
        >
          <h3 className="text-white font-semibold mb-4 text-lg border-b border-white/10 pb-2">
            Active Riders
          </h3>
          <div className="space-y-3">
            {riders.length === 0 ? (
              <p className="text-white/30 italic text-sm text-center py-10">
                No active riders on road...
              </p>
            ) : (
              riders.map((rider) => (
                <div
                  key={rider.id}
                  onClick={() => handleRiderClick(rider)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:bg-white/10 ${
                    selectedRider?.id === rider.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3 h-3 text-blue-400" />
                      <span className="text-white text-sm font-semibold">{rider.name}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 text-[10px] uppercase">
                      {rider.status}
                    </Badge>
                  </div>
                  <p className="text-white/40 text-[11px] leading-tight">{rider.address}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}