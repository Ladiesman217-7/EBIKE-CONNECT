import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { adminAuth, adminDb } from "./figma/firebase.js";
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
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      try {
        if (user) {
          try {
            const userSnap = await getDoc(doc(adminDb, "users", user.uid));
            if (userSnap.exists() && userSnap.data()?.role === "admin") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              await signOut(adminAuth);
            }
          } catch (firestoreError: any) {
            if (firestoreError.code === "unavailable") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              await signOut(adminAuth);
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
      const userCredential = await signInWithEmailAndPassword(adminAuth, email.trim(), password);
      const user = userCredential.user;

      try {
        const userSnap = await getDoc(doc(adminDb, "users", user.uid));
        if (userSnap.exists() && userSnap.data()?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          await signOut(adminAuth);
          setErrorMessage("Access denied. Admin privileges required.");
        }
      } catch (firestoreError: any) {
        if (firestoreError.code === "unavailable") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          await signOut(adminAuth);
          setErrorMessage("Could not verify admin role. Check Firestore rules.");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold">Admin Login</h1>
          <p className="text-white/60">EBIKE-CONNECT Management</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-white/90 block mb-2 text-sm">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white" placeholder="admin@ebike.com" required />
            </div>
          </div>

          <div>
            <label className="text-white/90 block mb-2 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-white font-bold h-12"
            style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}>
            {isLoading ? "Verifying..." : "SIGN IN"}
          </Button>

          <div className="text-center pt-2">
            <button type="button" onClick={() => navigate("/riderlogin")}
              className="text-white/60 hover:text-white/90 text-sm transition-colors">
              Are you a Rider? <span className="underline">Rider Login →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}