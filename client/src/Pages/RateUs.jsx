import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

function RateUs() {
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        user: "",
        message: "",
        rating: 5,
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            API.get("/auth/profile")
                .then(res => setFormData(prev => ({ ...prev, user: res.data.name })))
                .catch(err => console.log(err));
        }
    }, [isAuthenticated]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRatingClick = (val) => {
        setFormData({ ...formData, rating: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const res = await API.post("/feedback", formData);
            setStatus({ type: "success", message: res.data.message || "Thank you for your feedback!" });
            
            // Keep the name but reset other fields
            setFormData(prev => ({ ...prev, message: "", rating: 5 }));
            
            // Clear success message after 5 seconds
            setTimeout(() => setStatus({ type: "", message: "" }), 5000);
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            setStatus({ type: "error", message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] pt-8 pb-20">
            <div className="max-w-xl mx-auto px-6">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-premium">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-6">
                            <i className="fa-solid fa-star-half-stroke text-2xl"></i>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
                            Rate Your <span className="text-brand-orange">Experience</span>
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Your feedback helps us make Hungry Heist better for everyone.
                        </p>
                    </div>

                    {status.message && (
                        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                            status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                            <i className={`fa-solid ${status.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                            <p className="text-sm font-bold">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Star Rating UI */}
                        <div className="flex flex-col items-center gap-4 py-6 bg-gray-50 rounded-3xl border border-gray-100/50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Overall Rating</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingClick(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-all duration-200 transform hover:scale-110 active:scale-90"
                                    >
                                        <i className={`fa-solid fa-star text-3xl ${
                                            (hoverRating || formData.rating) >= star 
                                                ? 'text-brand-yellow drop-shadow-[0_0_8px_rgba(255,213,0,0.3)]' 
                                                : 'text-gray-200'
                                        }`}></i>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs font-black text-brand-orange uppercase tracking-wider h-4">
                                {formData.rating === 5 ? 'Excellent' : 
                                 formData.rating === 4 ? 'Good' :
                                 formData.rating === 3 ? 'Average' :
                                 formData.rating === 2 ? 'Poor' : 'Terrible'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Your Name</label>
                            <input
                                type="text"
                                name="user"
                                value={formData.user}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                required
                                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Tell us more</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="What did you love? What can we improve?"
                                required
                                rows="4"
                                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-brand-orange rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 outline-none transition-all shadow-inner resize-none"
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            className="py-5 text-sm font-black shadow-lg shadow-brand-orange/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                                </span>
                            ) : "Submit Honest Feedback"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RateUs;
