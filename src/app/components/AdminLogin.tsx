import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// Firebase imports
import { adminAuth as auth, db } from "./figma/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is already logged in as admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          if (userDoc.exists() && userData?.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            // Not an admin, kick them out
            await signOut(auth);
          }
        } catch (err) {
          console.error("Auth check failed:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userDoc.exists() && userData?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        await signOut(auth);
        setErrorMessage("Access Denied: Admin privileges required.");
      }
    } catch (error: any) {
      console.error("Login Error:", error.code);
      // Friendly error messages
      if (error.code === "auth/invalid-credential") {
        setErrorMessage("Maling email o password, pre.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessage("Masyadong maraming login attempts. Maya na ulit.");
      } else {
        setErrorMessage("Login failed. Check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#000000" }}>
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10"
        style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(20px)" }}>

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
                placeholder="admin@ebike.com" required
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
                autoComplete="new-password"
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                placeholder="••••••••" required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-white font-bold h-12 transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}>
            {isLoading ? "Verifying Admin..." : "SIGN IN"}
          </Button>

          <div className="text-center pt-2">
            <button type="button" onClick={() => navigate("/rider-login")} className="text-white/40 hover:text-white/80 text-xs uppercase tracking-widest transition-colors">
              Switch to Rider Interface →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}