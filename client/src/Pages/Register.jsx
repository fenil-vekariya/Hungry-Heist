import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { isAuthenticated, role: authRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && authRole) {
      if (authRole === "customer") navigate("/menu");
      else if (authRole === "restaurant") navigate("/restaurant-dashboard");
      else if (authRole === "admin") navigate("/admin-dashboard");
    }
  }, [isAuthenticated, authRole, navigate]);

  const handleRegister = async () => {
    setError("");
    if (password.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword: password, 
        role: role
      });

      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please check your network or try again.";
      setError(errorMsg); 
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-brand-yellow/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-orange-500 p-3 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <i className="fa-solid fa-user-plus text-white w-6 h-6 flex items-center justify-center text-xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm font-medium">Join Hungry Heist to order or sell food.</p>
        </div>

        <div className="space-y-4 w-full">
          {/* Full Name */}
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type="password"
                placeholder="Create a strong password"
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-shield-halved"></i>
              </span>
              <input
                type="password"
                placeholder="Repeat your password"
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="pt-2">
            <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider text-center">I want to register as a:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  role === "customer" 
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                <i className="fa-solid fa-user text-xl"></i>
                <span className="text-xs font-black uppercase tracking-widest">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("restaurant")}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  role === "restaurant" 
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                <i className="fa-solid fa-shop text-xl"></i>
                <span className="text-xs font-black uppercase tracking-widest">Restaurant</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={handleRegister}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              Create Account <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">
                Already have an account?{" "}
                <button 
                    onClick={() => navigate("/login")}
                    className="text-orange-500 font-bold hover:underline underline-offset-4"
                >
                    Login
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
