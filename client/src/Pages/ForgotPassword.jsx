import { useState } from "react";
import API from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await API.post("/auth/forgot-password", { email });
      setMessage("Reset link sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2 tracking-tighter uppercase">Forgot Password</h2>
          <p className="text-gray-400 text-sm font-medium">Enter your email to receive a reset link</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-xs font-bold text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all outline-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 uppercase font-black tracking-widest text-xs"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <Link to="/login" className="text-xs font-black text-gray-400 hover:text-brand-orange uppercase tracking-widest transition-all">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;
