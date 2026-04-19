import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Token may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2 tracking-tighter uppercase">Reset Password</h2>
          <p className="text-gray-400 text-sm font-medium">Create a new secure password</p>
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 transition-all outline-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 uppercase font-black tracking-widest text-xs"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default ResetPassword;
