import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  MessageSquare,
  LogOut,
  UserCog,
  Menu,
  X,
} from "lucide-react";

import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { adminAuth, adminDb } from "./figma/firebase.js";


import AttendanceList from "./AttendanceList";
import MapSection from "./MapSection";
import RiderProfiles from "./RiderProfiles";
import RiderManagement from "./RiderManagement";
import FeedbackSection from "./FeedbackSection";

type TabType =
  | "attendance"
  | "map"
  | "profiles"
  | "management"
  | "feedback";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("attendance");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      try {
        if (!user) {
          navigate("/adminlogin", { replace: true });
          return;
        }

        const userSnap = await getDoc(doc(adminDb, "users", user.uid));

        if (!userSnap.exists()) {
          await signOut(adminAuth);
          navigate("/adminlogin", { replace: true });
          return;
        }

        const userData = userSnap.data();

        if (userData?.role !== "admin") {
          await signOut(adminAuth);
          navigate("/adminlogin", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Admin auth check failed:", error);
        await signOut(adminAuth);
        navigate("/adminlogin", { replace: true });
      } finally {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(adminAuth);
      navigate("/adminlogin", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems: { id: TabType; label: string; icon: any }[] = [
    { id: "attendance", label: "Attendance", icon: LayoutDashboard },
    { id: "map", label: "Map", icon: MapPin },
    { id: "profiles", label: "Rider Profiles", icon: Users },
    { id: "management", label: "Management", icon: UserCog },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-white"
        style={{ backgroundColor: "#0B0B0C" }}
      >
        Checking admin access...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ backgroundColor: "#0B0B0C" }}
    >
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0B0B0C]/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-white text-lg font-bold">Admin Panel</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white/60 hover:text-white"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 p-6 flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out bg-[#0B0B0C]
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div>
          <div className="mb-8">
            <h1 className="text-white text-xl font-bold">Admin Dashboard</h1>
            <p className="text-white/50 text-sm">Manage riders and operations</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-0">
        <div className="max-w-7xl mx-auto">
          {activeTab === "attendance" && <AttendanceList />}
          {activeTab === "map" && <MapSection />}
          {activeTab === "profiles" && <RiderProfiles />}
          {activeTab === "management" && <RiderManagement />}
          {activeTab === "feedback" && <FeedbackSection />}
        </div>
      </main>
    </div>
  );
}