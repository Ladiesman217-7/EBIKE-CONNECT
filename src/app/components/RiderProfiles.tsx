import { MapPin, Phone, Star } from "lucide-react";
import { Badge } from "./ui/badge";
//STILL NO FUNCTIONALITY - JUST A DESIGN MOCKUP FOR NOW

interface RiderProfile {
  id: string;
  name: string;
  location: string;
  status: "Active" | "Offline" | "Idle";
  rating: number;
  trips: number;
  phone: string;
}

const mockProfiles: RiderProfile[] = [
  { id: "1", name: "Juan Dela Cruz", location: "Makati City", status: "Active", rating: 4.8, trips: 234, phone: "+63 917 123 4567" },
  { id: "2", name: "Maria Santos", location: "BGC, Taguig", status: "Active", rating: 4.9, trips: 312, phone: "+63 918 234 5678" },
  { id: "3", name: "Pedro Garcia", location: "Quezon City", status: "Idle", rating: 4.6, trips: 189, phone: "+63 919 345 6789" },
  { id: "4", name: "Carlos Reyes", location: "Mandaluyong", status: "Active", rating: 4.7, trips: 267, phone: "+63 920 456 7890" },
  { id: "5", name: "Ana Lopez", location: "Manila", status: "Offline", rating: 4.5, trips: 156, phone: "+63 921 567 8901" },
  { id: "6", name: "Diego Torres", location: "Pasig City", status: "Active", rating: 4.9, trips: 398, phone: "+63 922 678 9012" },
  { id: "7", name: "Sofia Ramirez", location: "Parañaque", status: "Offline", rating: 4.4, trips: 142, phone: "+63 923 789 0123" },
  { id: "8", name: "Miguel Fernandez", location: "San Juan", status: "Idle", rating: 4.6, trips: 203, phone: "+63 924 890 1234" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Idle":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export default function RiderProfiles() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white mb-2">Rider Profiles</h1>
        <p className="text-white/60">Detailed information about active riders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProfiles.map((rider) => (
          <div
            key={rider.id}
            className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)",
                }}
              >
                <span className="text-white">
                  {rider.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <Badge className={getStatusColor(rider.status)}>
                {rider.status}
              </Badge>
            </div>

            {/* Profile Info */}
            <h3 className="text-white mb-1">{rider.name}</h3>
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>{rider.location}</span>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white">{rider.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Total Trips</span>
                <span className="text-white">{rider.trips}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 text-white/60 text-sm pt-4 border-t border-white/10">
              <Phone className="w-4 h-4" />
              <span>{rider.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
