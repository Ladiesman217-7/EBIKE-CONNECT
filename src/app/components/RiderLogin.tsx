import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// Tama na ang import na ito:
import { auth, db } from "./figma/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function RiderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role?.toLowerCase().trim() === "rider") {
            navigate("/rider/interface");
          } else if (userDoc.exists()) {
            await signOut(auth);
          }
        } catch (err) {
          console.error("Auth check error:", err);
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
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists() && userDoc.data().role?.toLowerCase().trim() === "rider") {
        navigate("/rider/interface");
      } else {
        await signOut(auth);
        setErrorMessage("Access Denied: Hindi ka rehistrado bilang Rider.");
      }
    } catch (error: any) {
      console.error("Login Error:", error.code);
      setErrorMessage("Maling email o password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold">Rider Login</h1>
          <p className="text-white/60">EBIKE-CONNECT Rider Portal</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-white/90 block mb-2 text-sm font-medium">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white" placeholder="rider@example.com" required />
            </div>
          </div>

          <div>
            <label className="text-white/90 block mb-2 text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 bg-white/5 border-white/10 text-white" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-white font-bold h-12 border-0" style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}>
            {isLoading ? "Signing In..." : "SIGN IN"}
          </Button>

          <div className="text-center pt-2">
            <button type="button" onClick={() => navigate("/adminlogin")} className="text-white/40 hover:text-white/80 text-sm transition-colors">
              Admin Login →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}