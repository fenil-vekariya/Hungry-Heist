import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role) {
      if (role === "customer") navigate("/menu");
      else if (role === "restaurant") navigate("/restaurant-dashboard");
      else if (role === "admin") navigate("/admin-dashboard");
      else if (role === "partner") navigate("/delivery-agent-dashboard");
    }
  }, [isAuthenticated, role, navigate]);


  const handleExplore = () => {
    if (isAuthenticated) {
      if (role === "customer") navigate("/menu");
      else if (role === "restaurant") navigate("/restaurant-dashboard");
      else if (role === "admin") navigate("/admin-dashboard");
      else if (role === "partner") navigate("/delivery-agent-dashboard");
    } else {
      navigate("/login?role=customer");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 font-sans">
      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <i className="fa-solid fa-utensils text-white"></i>
          </div>
          <span className="text-xl font-bold text-gray-800">Hungry Heist</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-orange-500 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-orange-600 transition-all"
          >
            Register
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="py-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
          Discover Delicious <span className="text-orange-500">Food Near You</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Explore your favorite restaurants with ease. Discover quality food and a seamless ordering experience for dine-in and takeaways.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleExplore}
            className="w-full sm:w-auto px-10 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Explore Menu
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg shadow-md border border-gray-100 hover:bg-gray-50 transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-fire-flame-curved text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Authentic Taste</h3>
              <p className="text-sm text-gray-500">We feature restaurants that prioritize quality, freshness, and authentic flavors.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-star text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Quality Food</h3>
              <p className="text-sm text-gray-500">Only the best restaurants are featured on our platform for your delight.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-md text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-cart-shopping text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Easy Ordering</h3>
              <p className="text-sm text-gray-500">A seamless UI that makes finding your favorite meal a walk in the park.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-16">How It <span className="text-orange-500">Works</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Create an Account</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Sign up quickly and set up your profile to get started.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Browse & Order</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Choose your favorite food from restaurants and order easily.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Wait & Enjoy</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Get your food delivered hot and fresh at your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 px-6 bg-white border-t border-gray-100 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-orange-500 p-1 rounded-lg">
              <i className="fa-solid fa-utensils text-white text-xs"></i>
            </div>
            <span className="font-bold text-gray-800">Hungry Heist</span>
          </div>
          <div className="flex justify-center gap-8 mb-8">
            <a href="#features" className="text-gray-400 hover:text-orange-500 transition-colors">About Us</a>
            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Privacy Policy</a>
            <Link to="/rate-us" className="text-gray-400 hover:text-orange-500 transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 Hungry Heist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;

