import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { adminAuth as auth, db } from "./figma/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          navigate("/admin/dashboard");
        } else if (userDoc.exists()) {
          await signOut(auth);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists() && userDoc.data().role === "admin") {
        navigate("/admin/dashboard");
      } else {
        await signOut(auth);
        alert("Access Denied: This account does not have Admin privileges.");
      }
    } catch (error: any) {
      alert("Login failed: Please check your credentials.");
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
          <p className="text-white/60">Enter admin credentials</p>
        </div>

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
                className="pl-10 bg-white/5 border-white/10 text-white"
                placeholder="admin@example.com" required
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
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white"
                placeholder="••••••••" required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-white font-medium"
            style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}>
            {isLoading ? "Verifying..." : "Sign In"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={() => navigate("/rider")} className="text-white/60 hover:text-white/90 text-sm">
              Rider Login →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}