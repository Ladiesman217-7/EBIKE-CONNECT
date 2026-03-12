import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// db and auth imports
import { riderAuth as auth, db } from "./figma/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function RiderLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in and is a rider
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role.trim() === "rider") {
          navigate("/rider/interface");
        } else if (userDoc.exists()) {
          // Force logout if the role doesn't match
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
      // Authenticate Email/Password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // get rider role sa Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists() && userDoc.data().role.trim() === "rider") {
        console.log("Rider Login successful!");
        navigate("/rider/interface");
      } else {
        // Reject if not a Rider
        await signOut(auth);
        alert("Access Denied: This account is not registered as a Rider.");
      }
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      alert("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#000000" }}>
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/10"
        style={{ background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>

        <div className="text-center mb-8">
          <h1 className="text-white mb-2 text-2xl font-bold">Rider Login</h1>
          <p className="text-white/60">Enter your credentials</p>
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
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="rider@example.com" required
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
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                placeholder="Enter password" required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-white border-0 font-medium"
            style={{ background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)" }}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={() => navigate("/adminlogin")} className="text-white/60 hover:text-white/90 text-sm">
              Admin Login →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}