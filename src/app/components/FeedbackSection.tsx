import Masonry from "react-responsive-masonry";
import { Star, User } from "lucide-react";
//STILL NO FUNCTIONALITY - JUST A DESIGN MOCKUP FOR NOW
interface Feedback {
  id: string;
  userName: string;
  riderName: string;
  rating: number;
  comment: string;
  date: string;
}

const mockFeedback: Feedback[] = [
  {
    id: "1",
    userName: "Sarah Chen",
    riderName: "Juan Dela Cruz",
    rating: 5,
    comment: "Excellent service! Very professional and arrived on time. Highly recommended!",
    date: "March 1, 2026"
  },
  {
    id: "2",
    userName: "Mike Johnson",
    riderName: "Maria Santos",
    rating: 5,
    comment: "Best ride ever! Super friendly and knows all the shortcuts. Will definitely book again.",
    date: "March 1, 2026"
  },
  {
    id: "3",
    userName: "Emma Williams",
    riderName: "Carlos Reyes",
    rating: 4,
    comment: "Good ride, smooth journey. Just a bit late but overall great experience.",
    date: "February 29, 2026"
  },
  {
    id: "4",
    userName: "James Brown",
    riderName: "Diego Torres",
    rating: 5,
    comment: "Outstanding! Very safe driver and very polite. Five stars!",
    date: "February 29, 2026"
  },
  {
    id: "5",
    userName: "Lisa Anderson",
    riderName: "Pedro Garcia",
    rating: 4,
    comment: "Nice ride, comfortable throughout the journey. Would recommend.",
    date: "February 28, 2026"
  },
  {
    id: "6",
    userName: "David Martinez",
    riderName: "Juan Dela Cruz",
    rating: 5,
    comment: "Fantastic service! Very helpful with my bags and super friendly.",
    date: "February 28, 2026"
  },
  {
    id: "7",
    userName: "Sophia Lee",
    riderName: "Maria Santos",
    rating: 5,
    comment: "Amazing! Fast, safe, and professional. This is my go-to rider now.",
    date: "February 27, 2026"
  },
  {
    id: "8",
    userName: "Robert Taylor",
    riderName: "Diego Torres",
    rating: 4,
    comment: "Great ride! Clean bike and very friendly rider. Will book again for sure.",
    date: "February 27, 2026"
  },
];

export default function FeedbackSection() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white mb-2">Customer Feedback</h1>
        <p className="text-white/60">Reviews and ratings from passengers</p>
      </div>

      <Masonry columnsCount={3} gutter="24px">
        {mockFeedback.map((feedback) => (
          <div
            key={feedback.id}
            className="rounded-2xl border border-white/10 p-6 break-inside-avoid"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < feedback.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-white/80 mb-4">{feedback.comment}</p>

            {/* User Info */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-white/40" />
                <span className="text-white text-sm">{feedback.userName}</span>
              </div>
              <div className="text-white/60 text-sm">
                Rider: {feedback.riderName}
              </div>
              <div className="text-white/40 text-xs mt-1">{feedback.date}</div>
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
}
