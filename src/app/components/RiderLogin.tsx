import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { riderAuth, riderDb } from "./figma/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


export default function RiderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(riderAuth, async (user) => {
      try {
        if (user) {
          try {
            const userDoc = await getDoc(doc(riderDb, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role?.trim() === "rider") {
              navigate("/rider/interface", { replace: true });
            } else {
              await signOut(riderAuth);
            }
          } catch (firestoreError: any) {
            if (firestoreError.code === "unavailable") {
              navigate("/rider/interface", { replace: true });
            } else {
              await signOut(riderAuth);
            }
          }
        }
      } finally {
        setCheckingSession(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(riderAuth, email.trim(), password);
      const user = userCredential.user;

      try {
        const userDoc = await getDoc(doc(riderDb, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role?.trim() === "rider") {
          navigate("/rider/interface", { replace: true });
        } else {
          await signOut(riderAuth);
          setErrorMessage("Access Denied: This account is not registered as a Rider.");
        }
      } catch (firestoreError: any) {
        if (firestoreError.code === "unavailable") {
          navigate("/rider/interface", { replace: true });
        } else {
          await signOut(riderAuth);
          setErrorMessage("Could not verify rider role. Check Firestore rules.");
        }
      }

    } catch (error: any) {
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        setErrorMessage("Maling email o password.");
      } else if (error.code === "unavailable" || error.message?.includes("offline")) {
        setErrorMessage("Walang internet connection.");
      } else {
        setErrorMessage(`Login failed: ${error.code ?? "unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-black">Checking session...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#000000" }}>
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px 0 rgba(0,0,0,0.37)" }}>

        <div className="text-center mb-8">
          <h1 className="text-white mb-2 text-2xl font-bold">Rider Login</h1>
          <p className="text-white/60">Enter your credentials</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-white/90 block mb-2 text-sm">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="off" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="rider@example.com" required />
            </div>
          </div>

          <div>
            <label className="text-white/90 block mb-2 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="Enter password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-white border-0 font-medium"
            style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center pt-2">
            <button type="button" onClick={() => navigate("/adminlogin")}
              className="text-white/60 hover:text-white/90 text-sm transition-colors">
              ← Admin Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}