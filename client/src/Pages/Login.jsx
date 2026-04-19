import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";
import BackButton from "../components/BackButton";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, role: authRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && authRole) {
      if (authRole === "customer") navigate("/menu");
      else if (authRole === "restaurant") navigate("/restaurant-dashboard");
      else if (authRole === "admin") navigate("/admin-dashboard");
      else if (authRole === "partner") navigate("/delivery-agent-dashboard");
    }
  }, [isAuthenticated, authRole, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const backendRole = res.data.role;
      login({ token: res.data.token, role: backendRole });

      if (backendRole === "customer") navigate("/menu");
      else if (backendRole === "restaurant") navigate("/restaurant-dashboard");
      else if (backendRole === "admin") navigate("/admin-dashboard");
      else if (backendRole === "partner") navigate("/delivery-agent-dashboard");
      
    } catch (err) {
      console.log(err);
      const serverMessage = err.response?.data?.message || "Login failed. Please check your details and try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-brand-yellow/10 rounded-full blur-3xl"></div>
      </div>

      <BackButton className="absolute top-6 left-6 z-50" />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-orange-500 p-3 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <i className="fa-solid fa-utensils text-white w-6 h-6 flex items-center justify-center text-xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-sm font-medium">Sign in to continue your heist for hunger.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 w-full">
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

          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-lg">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-14 pr-12 py-3 rounded-xl bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200 font-medium tracking-wider"
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
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-[10px] font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest transition-all"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i> Signing in...
                </>
              ) : (
                <>
                  Sign In <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="relative w-full flex items-center justify-center">
            <div className="border-t border-gray-100 w-full"></div>
            <span className="bg-white px-3 text-gray-400 text-[10px] uppercase font-bold tracking-widest absolute">Or continue with</span>
          </div>
          
          <div className="w-full flex justify-center pt-2">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                try {
                  const decoded = jwtDecode(credentialResponse.credential);
                  console.log("Google Login Success:", decoded);
                  
                  // For now, we simulate a login with a "customer" role
                  // In a real app, you would send the token to your backend to verify
                  login({ 
                    token: credentialResponse.credential, 
                    role: "customer",
                    name: decoded.name,
                    email: decoded.email
                  });
                  
                  navigate("/menu");
                } catch (err) {
                  console.error("Token decode error:", err);
                  setError("Failed to process Google login.");
                }
              }}
              onError={() => {
                console.log('Login Failed');
                setError("Google Sign-In failed. Please try again.");
              }}
              useOneTap
              theme="outline"
              shape="pill"
              size="large"
              width="100%"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm font-medium">
                Don't have an account?{" "}
                <button 
                    onClick={() => navigate("/register")}
                    className="text-orange-500 font-bold hover:underline underline-offset-4"
                >
                    Register Now
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

