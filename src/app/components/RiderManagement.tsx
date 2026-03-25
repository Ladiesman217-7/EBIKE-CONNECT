import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { adminDb } from "./figma/firebase.js";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";

interface Rider {
  id: string;
  name: string;
  riderType: "Regular" | "Miner";

  phone?: string;
}

export default function RiderManagement() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(adminDb, "users"), where("role", "==", "rider"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Rider[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || data.riderName || "Unknown Rider",
          riderType: data.riderType === "Miner" ? "Miner" : "Regular",
          trips: data.trips || 0,
          phone: data.phone || "",
        };
      });
      setRiders(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleRole = async (id: string, current: "Regular" | "Miner") => {
    const newType = current === "Regular" ? "Miner" : "Regular";
    setSwitching(id);
    try {
      await updateDoc(doc(adminDb, "users", id), { riderType: newType });
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setSwitching(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "text-green-400";
      case "idle": return "text-yellow-400";
      default: return "text-white/40";
    }
  };

  if (loading) {
    return <div className="p-8 text-white/50 animate-pulse">Loading riders...</div>;
  }

  const regularCount = riders.filter((r) => r.riderType === "Regular").length;
  const minerCount = riders.filter((r) => r.riderType === "Miner").length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-2">Rider Management</h1>
        <p className="text-white/60">Manage rider roles and permissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <h3 className="text-white font-semibold">Regular Riders</h3>
          </div>
          <p className="text-white/50 text-sm mb-3">Standard riders with regular access</p>
          <p className="text-blue-400 text-2xl font-bold">{regularCount}</p>
        </div>

        <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <h3 className="text-white font-semibold">Miner Riders</h3>
          </div>
          <p className="text-white/50 text-sm mb-3">Elite riders with exclusive booking privileges</p>
          <p className="text-purple-400 text-2xl font-bold">{minerCount}</p>
        </div>
      </div>

      {/* Riders Table */}
      <div
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}
      >
        <div className="overflow-x-auto">
          {riders.length === 0 ? (
            <div className="p-12 text-center text-white/30 italic">
              No riders found. Add riders to Firestore with role: "rider".
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white/60 text-sm font-medium">Rider Name</th>
                  <th className="text-left py-4 px-6 text-white/60 text-sm font-medium">Type</th>
                  <th className="text-left py-4 px-6 text-white/60 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider) => (
                  <tr key={rider.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {/* Avatar with type color */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{
                            background: rider.riderType === "Miner"
                              ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                              : "linear-gradient(135deg, #1d4ed8, #60a5fa)",
                          }}
                        >
                          {rider.name.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{rider.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <Badge
                        className={
                          rider.riderType === "Miner"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }
                      >
                        {rider.riderType}
                      </Badge>
                    </td>

                    <td className="py-4 px-6">
                      <Button
                        onClick={() => toggleRole(rider.id, rider.riderType)}
                        disabled={switching === rider.id}
                        className="text-white border-0 text-sm disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}
                      >
                        {switching === rider.id
                          ? "Switching..."
                          : `Switch to ${rider.riderType === "Regular" ? "Miner" : "Regular"}`}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}