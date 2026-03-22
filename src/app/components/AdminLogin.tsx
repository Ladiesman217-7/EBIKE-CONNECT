import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { auth, db } from "./figma/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setCheckingSession(false);
          return;
        }

        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
          await signOut(auth);
          setErrorMessage("No admin profile found.");
          setCheckingSession(false);
          return;
        }

        const userData = userSnap.data();

        if (userData?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }

        await signOut(auth);
        setErrorMessage("Access denied. Admin privileges required.");
      } catch (error: any) {
        console.error("Auth session check failed:", error);
        setErrorMessage(error?.message || "Failed to verify admin session.");
      } finally {
        setCheckingSession(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (!userSnap.exists()) {
        await signOut(auth);
        setErrorMessage("No user profile found in Firestore.");
        return;
      }

      const userData = userSnap.data();

      if (userData?.role !== "admin") {
        await signOut(auth);
        setErrorMessage("Access denied. Admin privileges required.");
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Admin login error:", error);

      if (error?.code === "auth/invalid-credential") {
        setErrorMessage("Invalid email or password.");
      } else if (error?.code === "auth/too-many-requests") {
        setErrorMessage("Too many login attempts. Try again later.");
      } else if (error?.code === "permission-denied") {
        setErrorMessage("Firestore permission denied.");
      } else if (error?.code === "auth/network-request-failed") {
        setErrorMessage("Network error. Check your internet connection.");
      } else {
        setErrorMessage(error?.message || "Admin login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-white"
        style={{ backgroundColor: "#000000" }}
      >
        Checking admin session...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#000000" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl border border-white/10"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-white mb-2 text-2xl font-bold">Admin Login</h1>
          <p className="text-white/60">EBIKE-CONNECT Management</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-white/90 block mb-2 text-sm">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="admin@ebike.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-white/90 block mb-2 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-bold h-12 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}
          >
            {isLoading ? "Verifying Admin..." : "SIGN IN"}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/rider-login")}
              className="text-white/40 hover:text-white/80 text-xs uppercase tracking-widest transition-colors"
            >
              Switch to Rider Interface →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}