import { createBrowserRouter } from "react-router";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import RiderLogin from "./components/RiderLogin";
import RiderInterface from "./components/RiderInterface";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminLogin,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
  {
    path: "/rider",
    Component: RiderLogin,
  },
  {
    path: "/rider/interface",
    Component: RiderInterface,
  },
]);
