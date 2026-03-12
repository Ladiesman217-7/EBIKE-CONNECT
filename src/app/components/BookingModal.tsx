import { useState } from "react";
import { X, MapPin, User, Phone } from "lucide-react";
import { Button } from "./ui/button";

interface BookingModalProps {
  onClose: () => void;
}
//STILL NO FUNCTIONALITY - JUST A DESIGN MOCKUP FOR NOW
export default function BookingModal({ onClose }: BookingModalProps) {
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected">("pending");

  const handleAccept = () => {
    setStatus("accepted");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleReject = () => {
    setStatus("rejected");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div 
        className="w-full max-w-md rounded-2xl border border-white/10 p-6 relative"
        style={{
          background: "rgba(11, 11, 12, 0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px 0 rgba(0, 0, 0, 0.5)"
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>

        {status === "pending" && (
          <>
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
                style={{
                  background: "linear-gradient(135deg, #C13584 0%, #FCAF45 100%)",
                }}
              >
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white mb-2">New Booking Request!</h2>
              <p className="text-white/60 text-sm">A passenger needs a ride</p>
            </div>

            <div className="space-y-4 mb-6">
              <div 
                className="p-4 rounded-lg border border-white/10"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <User className="w-5 h-5 text-white/60 mt-1" />
                  <div>
                    <div className="text-white text-sm mb-1">Passenger</div>
                    <div className="text-white">Sarah Chen</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <Phone className="w-5 h-5 text-white/60 mt-1" />
                  <div>
                    <div className="text-white text-sm mb-1">Contact</div>
                    <div className="text-white/80">+63 917 123 4567</div>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 rounded-lg border border-white/10"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <div className="text-white text-sm mb-1">Pickup Location</div>
                    <div className="text-white/80">SM Megamall, Mandaluyong</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-400 mt-1" />
                  <div>
                    <div className="text-white text-sm mb-1">Drop-off Location</div>
                    <div className="text-white/80">Bonifacio Global City, Taguig</div>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 rounded-lg border border-white/10"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white/60 text-sm">Distance</div>
                    <div className="text-white">5.2 km</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">Estimated Fare</div>
                    <div className="text-white">₱120</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm">ETA</div>
                    <div className="text-white">15 mins</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleReject}
                className="h-14 text-white border border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
              >
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                className="h-14 text-white border-0"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                }}
              >
                Accept Ride
              </Button>
            </div>
          </>
        )}

        {status === "accepted" && (
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
            <h2 className="text-white mb-2">Booking Accepted!</h2>
            <p className="text-white/60">Navigate to pickup location</p>
          </div>
        )}

        {status === "rejected" && (
          <div className="text-center py-8">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
              }}
            >
              <X className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white mb-2">Booking Rejected</h2>
            <p className="text-white/60">Looking for next available ride</p>
          </div>
        )}
      </div>
    </div>
  );
}
