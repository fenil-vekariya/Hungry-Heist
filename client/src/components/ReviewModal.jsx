import { useState } from "react";
import Button from "./Button";
import API from "../services/api";

function ReviewModal({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await API.post("/reviews", {
        orderId: order._id,
        rating,
        comment
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h2 className="text-2xl font-black text-gray-800 mb-2">Rate your order</h2>
        <p className="text-gray-500 mb-6 text-sm">
          How was your meal from <span className="font-bold text-gray-700">{order.restaurant?.name || "the restaurant"}</span>?
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-all duration-200 transform hover:scale-110 ${
                    star <= rating ? "text-brand-yellow drop-shadow-sm" : "text-gray-200"
                  }`}
                >
                  <i className={`fa-solid fa-star`}></i>
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {rating === 5 ? "Excellent!" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Your Feedback</label>
            <textarea
              required
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or what could be improved..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none resize-none text-sm bg-gray-50"
            ></textarea>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-100 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              className="flex-1" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              loading={loading}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
