import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { isAuthenticated, role: authRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && authRole) {
      if (authRole === "customer") navigate("/menu");
      else if (authRole === "restaurant") navigate("/restaurant-dashboard");
      else if (authRole === "admin") navigate("/admin-dashboard");
      else if (authRole === "partner") navigate("/delivery-agent-dashboard");
    }
  }, [isAuthenticated, authRole, navigate]);

  const handleRegister = async () => {
    setError("");

    // 1. Mandatory Field Verification ("Fill up the blank")
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError("Please fill up all the blanks");
      return;
    }

    if (role === "partner" && (!vehicleType || !vehicleNumber.trim())) {
      setError("Please provide your vehicle details to continue");
      return;
    }

    // 2. Password Length Verification (Min 6 characters)
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (phone.trim().length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        email,
        phone,
        password,
        confirmPassword: password, 
        role: role,
        vehicleType: role === "partner" ? vehicleType : "",
        vehicleNumber: role === "partner" ? vehicleNumber : ""
      });

      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please check your network or try again.";
      setError(errorMsg); 
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 bg-[#FEF6F0]">
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-yellow-400/10 rounded-full blur-3xl"></div>
      </div>

      <BackButton className="absolute top-6 left-6 z-50" />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-orange-500 p-3 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <i className="fa-solid fa-user-plus text-white text-xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">Create Account</h2>
          <p className="text-gray-500 text-sm font-medium">Join Hungry Heist to order or deliver food.</p>
        </div>

        <div className="space-y-4 w-full">
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 text-gray-800"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 text-gray-800"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-semibold text-gray-700">Phone Number</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-phone"></i>
              </span>
              <input
                type="tel"
                placeholder="9876543210"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 text-gray-800"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200 font-medium tracking-wider"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors p-1"
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-shield-halved"></i>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat password"
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200 font-medium tracking-wider"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors p-1"
              >
                <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider text-center">Register As:</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-300 ${
                  role === "customer" 
                    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <i className="fa-solid fa-user text-lg"></i>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("restaurant")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-300 ${
                  role === "restaurant" 
                    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <i className="fa-solid fa-shop text-lg"></i>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Vendor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("partner")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-300 ${
                  role === "partner" 
                    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <i className="fa-solid fa-motorcycle text-lg"></i>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Delivery Agent</span>
              </button>
            </div>
          </div>

          {role === "partner" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Vehicle Type</label>
                <select
                  value={vehicleType}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 text-gray-800 font-medium"
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Electric">Electric</option>
                  <option value="Cycle">Cycle</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Vehicle Number</label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 1234"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition duration-200 text-gray-800"
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold text-center border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={handleRegister}
              className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-md flex items-center justify-center gap-2 transform"
            >
              Start Your Journey <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">
                Already part of the heist?{" "}
                <button 
                    onClick={() => navigate("/login")}
                    className="text-orange-500 font-bold hover:underline underline-offset-4"
                >
                    Log In
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
