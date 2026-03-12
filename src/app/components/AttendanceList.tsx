import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { db } from "./figma/firebase.js";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { RotateCw } from "lucide-react"; // Added for the refresh icon
import { Button } from "./ui/button";

type RiderStatus = "Active" | "Offline";

interface Rider {
  id: string;
  name: string;
  status: RiderStatus;
  location: string;
  lastUpdate: string;
  dayupdate: string;
}

const getStatusColor = (status: RiderStatus) => {
  switch (status) {
    case "Active":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Offline":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export default function AttendanceList() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [totalRiderCount, setTotalRiderCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  //visual refresh/re-sync
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    const attendanceQuery = query(
      collection(db, "attendance"),
      orderBy("timestamp", "desc")
    );

    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      const list: Rider[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

       //if location is missing, "N/A", or "Manila", default to "Santa Rosa, Laguna" for better readability in the dashboard
        const displayLocation = (!data.location || data.location === "N/A" || data.location === "Manila")
          ? "Santa Rosa, Laguna"
          : data.location;

        list.push({
          id: docSnap.id,
          name: data.riderName || "Rider",
          status: (data.status as RiderStatus) || "Offline",
          location: displayLocation,
          lastUpdate: data.timestamp?.seconds
            ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString([], {
              weekday: "long",
              hour: "2-digit",
              minute: "2-digit",
            })
            : "Just now",
          dayupdate: "",
        });
      });

      setRiders(list);
    });

    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", "rider")
    );

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setTotalRiderCount(snapshot.size);
    });

    return () => {
      unsubscribeAttendance();
      unsubscribeUsers();
    };
  }, []);

  const activeCount = riders.filter((rider) => rider.status === "Active").length;
  const recordedOfflineCount = riders.filter((rider) => rider.status === "Offline").length;
  const offlineCount = Math.max(totalRiderCount - activeCount, recordedOfflineCount);

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-white text-2xl font-bold mb-2">Attendance List</h1>
          <p className="text-white/60">Real-time rider status and location tracking</p>
        </div>

        <Button
          variant="outline"
          onClick={handleManualRefresh}
          className="border-white/10 text-white/60 hover:text-white bg-white/5"
        >
          <RotateCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Sync
        </Button>
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
              <tr className="border-b border-white/10 text-left">
                <th className="py-4 px-6 text-white/90">Rider Name</th>
                <th className="py-4 px-6 text-white/90">Status</th>
                <th className="py-4 px-6 text-white/90">Location</th>
                <th className="py-4 px-6 text-white/90">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {riders.length > 0 ? (
                riders.map((rider) => (
                  <tr
                    key={rider.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-white font-medium">{rider.name}</td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusColor(rider.status)}>
                        {rider.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-white/60">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {rider.location}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/40 text-sm">{rider.lastUpdate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-white/40 italic">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="p-6 rounded-xl border border-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="text-green-400 mb-1 font-medium text-sm uppercase tracking-wider">Active Now</div>
          <div className="text-white text-3xl font-bold">{activeCount}</div>
        </div>

        <div
          className="p-6 rounded-xl border border-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="text-gray-400 mb-1 font-medium text-sm uppercase tracking-wider">Offline</div>
          <div className="text-white text-3xl font-bold">{offlineCount}</div>
        </div>
      </div>
    </div>
  );
}