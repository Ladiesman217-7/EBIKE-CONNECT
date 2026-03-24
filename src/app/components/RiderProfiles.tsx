import { useState, useEffect } from "react";
import { MapPin, Phone, Star } from "lucide-react";
import { Badge } from "./ui/badge";
import { adminDb } from "./figma/firebase.js";
import { collection, onSnapshot, query, where } from "firebase/firestore";

interface RiderProfile {
  id: string;
  name: string;
  currentAddress: string; // Ito ang field sa database for current location ng rider
  status: string;
  rating: number;
  trips: number;
  phone: string;
}

export default function RiderProfiles() {
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. REAL-TIME FETCHING  SA FIREBASE
  useEffect(() => {
    // Kinukuha lang natin ang mga 'role === rider' mula sa users collection
    const q = query(collection(adminDb, "users"), where("role", "==", "rider"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const riderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RiderProfile[];

      setRiders(riderList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. STATUS STYLES LOGIC
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { color: 'bg-green-500', badge: 'bg-green-500/10 text-green-500 border-green-500/20', pulse: true };
      case 'idle':
        return { color: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', pulse: false };
      case 'offline':
        return { color: 'bg-gray-500', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', pulse: false };
      default:
        return { color: 'bg-gray-500', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', pulse: false };
    }
  };

  if (loading) return <div className="p-8 text-white/50 animate-pulse">Loading profiles...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">Rider Profiles</h1>
        <p className="text-white/60">Real-time status of all registered riders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {riders.map((rider) => {
          const config = getStatusConfig(rider.status);

          return (
            <div
              key={rider.id}
              className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all group"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}>
                    {rider.name?.charAt(0) || "R"}
                  </div>
                  {/* Status Dot on Avatar */}
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0B0B0C] ${config.color}`}>
                    {config.pulse && <span className={`absolute inset-0 rounded-full ${config.color} animate-ping opacity-75`}></span>}
                  </div>
                </div>

                <Badge className={`capitalize border ${config.badge}`}>
                  {rider.status || 'offline'}
                </Badge>
              </div>

              {/* Profile Info */}
              <h3 className="text-white text-lg font-semibold mb-1 group-hover:text-orange-400 transition-colors">
                {rider.name}
              </h3>

              <div className="flex items-center gap-2 text-white/40 text-sm mb-6 min-h-[40px]">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="line-clamp-2">{rider.currentAddress || "No location data"}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-medium">{rider.rating || "0.0"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Trips</p>
                  <span className="text-white font-medium">{rider.trips || "0"}</span>
                </div>
              </div>

              {/* Contact Button */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm border border-white/5">
                <Phone className="w-4 h-4" />
                {rider.phone || "09938069042"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}