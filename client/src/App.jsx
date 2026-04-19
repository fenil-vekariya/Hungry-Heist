import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Restaurants from "./Pages/Restaurants";
import Menu from "./Pages/Menu";
import Cart from "./Pages/Cart";
import Orders from "./Pages/Orders";
import RestaurantDashboard from "./Pages/RestaurantDashboard";
import RestaurantProfile from "./Pages/RestaurantProfile";
import AdminDashboard from "./Pages/AdminDashboard";
import DeliveryAgentDashboard from "./Pages/DeliveryAgentDashboard";
import DeliveryAgentProfile from "./Pages/DeliveryAgentProfile";
import RateUs from "./Pages/RateUs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./Pages/Profile";
import Checkout from "./Pages/Checkout";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";


function App() {
  const location = useLocation();
  const { initialising } = useAuth();

  const hiddenRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const hideNavbar = hiddenRoutes.includes(location.pathname);

  if (initialising) {
    return null;
  }

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? "" : "pt-20 min-h-[calc(100vh-80px)]"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin", "partner"]}>
                <Restaurants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu/:restaurantId"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-dashboard"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-profile"
            element={
              <ProtectedRoute allowedRoles={["restaurant"]}>
                <RestaurantProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-agent-dashboard"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <DeliveryAgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-agent/profile"
            element={
              <ProtectedRoute allowedRoles={["partner"]}>
                <DeliveryAgentProfile />
              </ProtectedRoute>
            }
          />
          {/* Legacy Redirect */}
          <Route
            path="/restaurant-onboarding"
            element={<Navigate to="/restaurant-profile" replace />}
          />
          <Route
            path="/partner-dashboard"
            element={<Navigate to="/delivery-agent-dashboard" replace />}
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/rate-us" element={<RateUs />} />
          <Route path="*" element={<div className="min-h-[60vh] flex flex-col items-center justify-center p-20">
            <h1 className="text-4xl font-black text-gray-800">404</h1>
            <p className="text-gray-500">Page not found</p>
          </div>} />
        </Routes>
      </main>
      {!hideNavbar && <Footer />}
    </>
  );
}

export default App;
