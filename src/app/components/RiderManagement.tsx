import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
//STILL NO FUNCTIONALITY - JUST A DESIGN MOCKUP FOR NOW
interface Rider {
  id: string;
  name: string;
  role: "Regular" | "Miner";
  trips: number;
  status: string;
}

const initialRiders: Rider[] = [
  { id: "1", name: "Juan Dela Cruz", role: "Regular", trips: 234, status: "Active" },
  { id: "2", name: "Maria Santos", role: "Miner", trips: 312, status: "Active" },
  { id: "3", name: "Pedro Garcia", role: "Regular", trips: 189, status: "Idle" },
  { id: "4", name: "Carlos Reyes", role: "Miner", trips: 267, status: "Active" },
  { id: "5", name: "Ana Lopez", role: "Regular", trips: 156, status: "Offline" },
  { id: "6", name: "Diego Torres", role: "Miner", trips: 398, status: "Active" },
  { id: "7", name: "Sofia Ramirez", role: "Regular", trips: 142, status: "Offline" },
  { id: "8", name: "Miguel Fernandez", role: "Regular", trips: 203, status: "Idle" },
];

export default function RiderManagement() {
  const [riders, setRiders] = useState<Rider[]>(initialRiders);

  const toggleRole = (id: string) => {
    setRiders(riders.map(rider => 
      rider.id === id 
        ? { ...rider, role: rider.role === "Regular" ? "Miner" : "Regular" }
        : rider
    ));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white mb-2">Rider Management</h1>
        <p className="text-white/60">Manage rider roles and permissions</p>
      </div>

      <div 
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-white/90">Rider Name</th>
                <th className="text-left py-4 px-6 text-white/90">Current Role</th>
                <th className="text-left py-4 px-6 text-white/90">Total Trips</th>
                <th className="text-left py-4 px-6 text-white/90">Status</th>
                <th className="text-left py-4 px-6 text-white/90">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-white">{rider.name}</td>
                  <td className="py-4 px-6">
                    <Badge 
                      className={
                        rider.role === "Miner"
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }
                    >
                      {rider.role}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-white/60">{rider.trips}</td>
                  <td className="py-4 px-6 text-white/60">{rider.status}</td>
                  <td className="py-4 px-6">
                    <Button
                      onClick={() => toggleRole(rider.id)}
                      className="text-white border-0 text-sm"
                      style={{
                        background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)",
                      }}
                    >
                      Switch to {rider.role === "Regular" ? "Miner" : "Regular"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="p-6 rounded-xl border border-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h3 className="text-white mb-2">Regular Riders</h3>
          <div className="text-white/60 text-sm mb-4">
            Standard riders with regular booking access
          </div>
          <div className="text-white">
            {riders.filter(r => r.role === "Regular").length} Riders
          </div>
        </div>

        <div 
          className="p-6 rounded-xl border border-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h3 className="text-white mb-2">Miner Riders</h3>
          <div className="text-white/60 text-sm mb-4">
            Elite riders with exclusive booking privileges
          </div>
          <div className="text-white">
            {riders.filter(r => r.role === "Miner").length} Riders
          </div>
        </div>
      </div>
    </div>
  );
}
