import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../services/api";
import Button from "./Button";

function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      API.get("/auth/profile")
        .then(res => setUsername(res.data.name))
        .catch(err => console.log(err));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const activeLinkStyle = ({ isActive }) =>
    `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive
      ? "bg-brand-orange/10 text-brand-orange"
      : "text-gray-600 hover:text-brand-orange hover:bg-gray-50"
    }`;

  const mobileNavLinkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
      ? "bg-brand-orange/10 text-brand-orange shadow-inner"
      : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"
    }`;

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm py-3" : "bg-transparent py-5"
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => navigate(isAuthenticated ? "/menu" : "/")}
          >
            <div className="bg-brand-orange p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <i className="fa-solid fa-utensils text-white w-6 h-6 flex items-center justify-center"></i>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-orange to-orange-400 bg-clip-text text-transparent">
              Hungry Heist
            </span>
          </div>


          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-2 mr-4">
                {role === "customer" && (
                  <>
                    <NavLink to="/restaurants" className={activeLinkStyle}>Restaurants</NavLink>
                    <NavLink to="/menu" className={activeLinkStyle}>Menu</NavLink>
                    <NavLink to="/my-orders" className={activeLinkStyle}>My Orders</NavLink>
                    <NavLink to="/rate-us" className={activeLinkStyle}>
                      Rate Us
                    </NavLink>
                  </>
                )}
                {role === "restaurant" && (
                  <NavLink to="/restaurant-dashboard" className={activeLinkStyle}>Dashboard</NavLink>
                )}
                {role === "admin" && (
                  <NavLink to="/admin-dashboard" className={activeLinkStyle}>Admin</NavLink>
                )}
                {role?.toLowerCase() === "partner" && (
                  <NavLink to="/delivery-agent-dashboard" className={activeLinkStyle}>Dashboard</NavLink>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 lg:gap-4">

              {isAuthenticated && role === "customer" && (
                <button
                  onClick={() => navigate("/cart")}
                  className="relative p-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <i className="fa-solid fa-cart-shopping text-gray-700 text-xl"></i>
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 bg-brand-orange text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce-short">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-xl`}></i>
                </button>
              )}

              {!isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
                  <Button onClick={() => navigate("/register")}>Register</Button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 pl-2 pr-4 py-2 hover:bg-gray-100 rounded-2xl transition-all"
                  >
                    <div className="w-10 h-10 bg-brand-yellow/30 text-brand-dark rounded-xl flex items-center justify-center font-bold">
                      {username.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-bold truncate max-w-[100px]">{username}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {role?.toLowerCase() === "partner" ? "Delivery Agent" : role}
                      </p>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-premium border border-gray-100 py-3 z-20 animate-fade-in">
                        <div className="px-5 py-3 border-bottom border-gray-50 mb-2">
                          <p className="text-xs text-gray-400 font-medium">ACCOUNT</p>
                          <p className="font-bold text-gray-800">{username}</p>
                        </div>

                        {role === "customer" && (
                          <button
                            onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                            className="w-full px-5 py-2.5 flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-brand-orange transition-colors text-sm font-medium"
                          >
                            <i className="fa-solid fa-user w-4"></i> Profile Details
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full px-5 py-2.5 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium mt-2 border-t border-gray-50 pt-4"
                        >
                          <i className="fa-solid fa-right-from-bracket w-4"></i> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-6 pt-24 animate-slide-in-right">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest pl-4 mb-2">Navigation</p>
              {role === "customer" && (
                <>
                  <NavLink to="/restaurants" className={mobileNavLinkStyle}>
                    <i className="fa-solid fa-hotel w-5"></i> Restaurants
                  </NavLink>
                  <NavLink to="/menu" className={mobileNavLinkStyle}>
                    <i className="fa-solid fa-bowl-food w-5"></i> Menu
                  </NavLink>
                  <NavLink to="/my-orders" className={mobileNavLinkStyle}>
                    <i className="fa-solid fa-list-check w-5"></i> My Orders
                  </NavLink>
                  <NavLink to="/rate-us" className={mobileNavLinkStyle}>
                    Rate Us
                  </NavLink>
                </>
              )}
              {role === "restaurant" && (
                <NavLink to="/restaurant-dashboard" className={mobileNavLinkStyle}>
                  <i className="fa-solid fa-chart-line w-5"></i> Dashboard
                </NavLink>
              )}
              {role === "admin" && (
                <NavLink to="/admin-dashboard" className={mobileNavLinkStyle}>
                  <i className="fa-solid fa-user-shield w-5"></i> Admin Panel
                </NavLink>
              )}
              {role?.toLowerCase() === "partner" && (
                <NavLink to="/delivery-agent-dashboard" className={mobileNavLinkStyle}>
                  <i className="fa-solid fa-truck-fast w-5"></i> Agent Dashboard
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;

