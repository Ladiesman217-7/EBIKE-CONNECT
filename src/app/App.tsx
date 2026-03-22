import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import RiderLogin from "./components/RiderLogin";
import AdminDashboard from "./components/AdminDashboard";
import RiderInterface from "./components/RiderInterface";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/adminlogin" replace />} />
      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/riderlogin" element={<RiderLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/rider/interface" element={<RiderInterface />} />
      <Route path="*" element={<Navigate to="/adminlogin" replace />} />
    </Routes>

  );
  console.log("TEST KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
}