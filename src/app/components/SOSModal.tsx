import { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
//STILL NO FUNCTIONALITY - JUST A DESIGN MOCKUP FOR NOW
interface SOSModalProps {
  onClose: () => void;
}

export default function SOSModal({ onClose }: SOSModalProps) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div 
        className="w-full max-w-md rounded-2xl border border-red-500/30 p-6 relative"
        style={{
          background: "rgba(11, 11, 12, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px 0 rgba(239, 68, 68, 0.3)"
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        {!sent ? (
          <>
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                }}
              >
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white mb-2">Emergency SOS</h2>
              <p className="text-white/60 text-sm">Send alert to admin immediately</p>
            </div>

            <div className="space-y-4 mb-6">
              <div 
                className="p-4 rounded-lg border border-red-500/20"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                }}
              >
                <p className="text-red-400 text-sm">
                  ⚠️ Your current location will be shared with the admin team
                </p>
              </div>

              <div>
                <label className="text-white/90 block mb-2">Emergency Message (Optional)</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[120px]"
                  placeholder="Describe your emergency..."
                />
              </div>

              <div 
                className="p-4 rounded-lg border border-white/10"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="text-white/60 text-sm mb-2">Your Current Location</div>
                <div className="text-white"> Makati City, Metro Manila</div>
                <div className="text-white/40 text-xs mt-1">14.5547° N, 121.0244° E</div>
              </div>
            </div>

            <Button
              onClick={handleSend}
              className="w-full h-14 text-white border-0"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              }}
            >
              <Send className="w-5 h-5 mr-2" />
              Send Emergency Alert
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              }}
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-white mb-2">Alert Sent!</h2>
            <p className="text-white/60">Admin has been notified of your emergency</p>
            <p className="text-green-400 text-sm mt-2">Help is on the way</p>
          </div>
        )}
      </div>
    </div>
  );
}
