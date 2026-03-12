import { useState } from "react";
import { Navigation } from "lucide-react";
import { Badge } from "./ui/badge";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface RiderLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  status: "Active" | "Idle";
}

const initialRiderLocations: RiderLocation[] = [
  { id: "1", name: "mark Cabrales", lat: 14.317986, lng: 121.112499, address: "Cataquiz, Santa Rosa", status: "Active" },
  { id: "2", name: "Maria Santos", lat: 14.315793, lng: 121.112390, address: "Ciudad Grande 1, Santa Rosa", status: "Active" },
];

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
    googleMapsApiKey: "AIzaSyCHjfnErYTvVhr-L49E-foP9u7wbfBodbc"
  });

  const [selectedRider, setSelectedRider] = useState<RiderLocation | null>(null);
  const [zoom, setZoom] = useState(13);


  const handleRiderClick = (rider: RiderLocation) => {
    setSelectedRider(rider);
    setZoom(17);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-2">Live GPS Tracking</h1>
        <p className="text-white/60">Real-time rider location monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 rounded-2xl border border-white/10 overflow-hidden relative"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            height: "600px",
          }}
        >
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              // Center logic: center on selected rider, or default if none
              center={selectedRider ? { lat: selectedRider.lat, lng: selectedRider.lng } : defaultCenter}
              zoom={zoom}
              options={mapOptions}
              // Optional: reset zoom if user drags the map away
              onDragStart={() => setZoom(zoom)}
            >
              {initialRiderLocations.map((rider) => (
                <Marker
                  key={rider.id}
                  position={{ lat: rider.lat, lng: rider.lng }}
                  title={rider.name}
                  icon={
                    rider.status === "Active"
                      ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                  }
                />
              ))}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              Loading Maps...
            </div>
          )}
        </div>

        <div
          className="rounded-2xl border border-white/10 p-6 overflow-y-auto"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            height: "600px",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-lg">Active Riders</h3>
            {/* Small button to zoom out and see everyone again */}
            {selectedRider && (
              <button
                onClick={() => { setSelectedRider(null); setZoom(13); }}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Reset View
              </button>
            )}
          </div>

          <div className="space-y-3">
            {initialRiderLocations.map((rider) => (
              <div
                key={rider.id}
                onClick={() => handleRiderClick(rider)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${selectedRider?.id === rider.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 bg-white/3 hover:border-white/20"
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className={`w-4 h-4 ${selectedRider?.id === rider.id ? "text-blue-400" : "text-white/60"}`} />
                    <span className="text-white text-sm font-medium">{rider.name}</span>
                  </div>
                  <Badge
                    className={
                      rider.status === "Active"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {rider.status}
                  </Badge>
                </div>
                <div className="text-white/40 text-xs font-medium italic">
                  {rider.address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}