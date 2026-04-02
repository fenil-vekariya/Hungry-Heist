import { useEffect, useState } from "react";
import API from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatters";

function RestaurantDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Orders State
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Profile State
  const [profile, setProfile] = useState(null);
  const [profileData, setProfileData] = useState({ 
    name: "", 
    description: "", 
    address: "",
    email: "",
    phone: ""
  });
  const [profileImg, setProfileImg] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [menuData, setMenuData] = useState({ name: "", price: "", description: "", category: "Veg" });
  const [menuImg, setMenuImg] = useState(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchMenu();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (profile && !profileData.name) {
      setProfileData({
        name: profile.name || "",
        description: profile.description || "",
        address: profile.address || "",
        email: profile.email || "",
        phone: profile.phone || ""
      });
    }
  }, [profile, profileData.name]);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/restaurant/my");
      setProfile(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProfile(null); 
      } else {
        console.log(err);
      }
    } finally {
      setInitialLoad(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/order/restaurant");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await API.get("/menu/my");
      setMenuItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
      if (res.data.length > 0) {
        setMenuData((prev) => ({ ...prev, category: res.data[0].name }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    if (!profile || !profile.name) {
      alert("Please create a restaurant profile first!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", menuData.name);
      formData.append("price", menuData.price);
      formData.append("description", menuData.description);
      formData.append("category", menuData.category);
      if (menuImg) formData.append("image", menuImg);

      await API.post("/menu/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMenuData({ name: "", price: "", description: "", category: categories[0]?.name || "Veg" });
      setMenuImg(null);
      fetchMenu();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || err.message || "Failed to add menu item.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/menu/delete/${id}`);
      fetchMenu();
    } catch (err) {
      console.log(err);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      setUpdating(true);
      await API.put(`/order/update/${id}`, { status });
      fetchOrders();
    } catch (err) {
      console.log(err);
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatuses = (current) => {
    if (current === "Pending") return ["Preparing"];
    if (current === "Preparing") return ["Out for Delivery"];
    if (current === "Out for Delivery") return ["Completed"];
    return [];
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderDashboardTab = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
          <h1 className="text-4xl font-black text-brand-orange mb-1">{orders.length}</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
          <h1 className="text-4xl font-black text-brand-orange mb-1">{menuItems.length}</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menu Items</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
          <h1 className="text-4xl font-black text-brand-orange mb-1">{orders.filter(o => o.status === "Pending").length}</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Orders</p>
        </div>
      </div>

      <div className="mt-10 pt-10 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-bolt text-brand-yellow"></i> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary" onClick={() => setActiveTab("orders")}>
            <i className="fa-solid fa-cart-shopping mr-2"></i> View Recent Orders
          </Button>
          <Button variant="secondary" onClick={() => setActiveTab("menu")}>
            <i className="fa-solid fa-plus mr-2"></i> Manage My Menu
          </Button>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800">Recent Orders</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-lg text-xs font-bold uppercase tracking-wider">
          <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></div>
          Live Updates
        </div>
      </div>

      {updating && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium border border-blue-100 flex items-center gap-2 animate-pulse">
          <i className="fa-solid fa-spinner fa-spin"></i> Syncing with server...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-medium tracking-tight">No orders have arrived yet.</p>
          </div>
        ) : orders.map((order) => {
          const nextStatuses = getNextStatuses(order.status);
          return (
            <div key={order._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-lg font-bold text-gray-800">{order.customer?.name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  order.status === "Pending" ? "bg-amber-100 text-amber-600" :
                  order.status === "Preparing" ? "bg-blue-100 text-blue-600" :
                  order.status === "Completed" ? "bg-green-100 text-green-600" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {order.status}
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex justify-between text-sm group">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="text-gray-800 font-mono text-[10px] bg-gray-50 p-1 rounded">#{order._id.slice(-6)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="text-gray-800 font-bold">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Date:</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Order Summary</p>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700">{item.menuItem?.name || "Item"}</span>
                        <span className="text-brand-orange">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {nextStatuses.length > 0 && (
                <div className="mt-auto pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <button 
                      key={status} 
                      onClick={() => updateOrderStatus(order._id, status)}
                      className="flex-1 px-4 py-2 bg-brand-orange text-white rounded-lg text-xs font-bold shadow-lg shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Process: {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );  const renderProfileTab = () => {
    return (
      <div className="animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-gray-800">Restaurant Profile</h2>
          <Button onClick={() => navigate("/restaurant-profile")}>
            <i className="fa-solid fa-pen-to-square mr-2"></i> Edit Details
          </Button>
        </div>
 
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 mx-auto md:mx-0">
              {profile.image ? (
                <img src={profile.image} alt="Logo" className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white" />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-brand-orange/10 flex items-center justify-center text-brand-orange text-4xl font-black shadow-inner">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-black text-gray-800 mb-2">{profile.name}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xl">{profile.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200/50">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Public Email</label>
                  <p className="text-gray-700 font-bold">{profile.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</label>
                  <p className="text-gray-700 font-bold">{profile.phone || "N/A"}</p>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                  <p className="text-gray-700 font-bold">{profile.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMenuTab = () => (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-extrabold text-gray-800">Manage Menu</h2>
        <div className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{menuItems.length} Items Listed</div>
      </div>

      {/* Add New Item Form Section */}
      <div className="bg-brand-orange shadow-lg shadow-brand-orange/10 rounded-2xl p-6 sm:p-8 mb-12 text-white overflow-hidden relative group">
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <i className="fa-solid fa-plus-circle"></i> Add New Menu Item
          </h3>
          <form onSubmit={handleMenuSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-80 px-1 text-white">Item Name</label>
              <input type="text" required placeholder="e.g. Paneer Tikka" className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white focus:text-gray-800 rounded-xl px-4 py-3 outline-none transition-all" value={menuData.name} onChange={(e) => setMenuData({ ...menuData, name: e.target.value })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-80 px-1 text-white">Price (₹)</label>
                <input type="number" required min="1" placeholder="99" className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white focus:text-gray-800 rounded-xl px-4 py-3 outline-none transition-all" value={menuData.price} onChange={(e) => setMenuData({ ...menuData, price: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-80 px-1 text-white">Category</label>
                <select required className="w-full bg-white/10 border-white/20 text-white focus:bg-white focus:text-gray-800 rounded-xl px-4 py-3 outline-none transition-all cursor-pointer" value={menuData.category} onChange={(e) => setMenuData({ ...menuData, category: e.target.value })}>
                  {categories.map((cat) => <option key={cat._id} value={cat.name} className="text-gray-800">{cat.name}</option>)}
                  {categories.length === 0 && <option value="Veg">Veg</option>}
                </select>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-80 px-1 text-white">Food Image</label>
              <input type="file" accept="image/*" required className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30 cursor-pointer" onChange={(e) => setMenuImg(e.target.files[0])} />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-80 px-1 text-white">Description (Optional)</label>
              <textarea placeholder="Tell your customers what makes this dish special..." rows="3" className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white focus:text-gray-800 rounded-xl px-4 py-3 outline-none transition-all" value={menuData.description} onChange={(e) => setMenuData({ ...menuData, description: e.target.value })} />
            </div>

            <div className="md:col-span-2 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-brand-orange font-black py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i> Adding Item...
                  </span>
                ) : (
                  "Add to Restaurant Menu"
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
      </div>

      <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <i className="fa-solid fa-list-ul text-brand-orange text-sm"></i> Your Active Menu Items
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="h-40 overflow-hidden relative">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <i className="fa-solid fa-image text-3xl text-gray-300"></i>
                </div>
              )}
              <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-black text-brand-orange shadow-sm uppercase tracking-tighter">
                {item.category}
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                <span className="text-brand-orange font-black">{formatPrice(item.price)}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-6 h-8">{item.description || "No description provided."}</p>
              
              <button 
                onClick={() => handleDeleteMenu(item._id)}
                className="w-full py-2.5 text-xs font-bold text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100"
              >
                <i className="fa-solid fa-trash-can mr-2"></i> Remove Item
              </button>
            </div>
          </div>
        ))}
        {menuItems.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <i className="fa-solid fa-utensils text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-medium tracking-tight">Your menu table is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (initialLoad) {
    return (
      <div className="app-page">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-10 text-center border border-gray-100">
          <div className="w-24 h-24 bg-brand-orange/10 text-brand-orange rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
            <i className="fa-solid fa-store"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Finalize Setup</h2>
          <p className="text-gray-500 font-medium mb-10 leading-relaxed">
            You're almost there! Complete your restaurant profile to unlock your personalized dashboard.
          </p>
          <Button fullWidth onClick={() => navigate("/restaurant-profile")}>
            Set Up My Profile <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 shadow-sm bg-white rounded-2xl mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-brand-orange/10 p-2 rounded-xl text-brand-orange">
              <i className="fa-solid fa-store text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">{profile.name}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">Restaurant Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <p className="text-sm font-bold text-gray-700">{profileData.name || "Manager"}</p>
                <p className="text-[10px] text-gray-400">Authorized Access</p>
             </div>
             <div className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-brand-orange/20">
               {profile.name.charAt(0)}
             </div>
          </div>
        </nav>

        {error && <p className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2"><i className="fa-solid fa-circle-exclamation"></i> {error}</p>}
        {successMsg && <p className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100 flex items-center gap-2"><i className="fa-solid fa-circle-check"></i> {successMsg}</p>}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">Navigation</p>
              
              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "dashboard" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("dashboard")}
              >
                <i className={`fa-solid fa-chart-line w-5 ${activeTab === "dashboard" ? "text-white" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Dashboard</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "orders" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("orders")}
              >
                <i className={`fa-solid fa-clipboard-list w-5 ${activeTab === "orders" ? "text-white" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Orders</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "profile" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("profile")}
              >
                <i className={`fa-solid fa-id-card w-5 ${activeTab === "profile" ? "text-white" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Profile</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "menu" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("menu")}
              >
                <i className={`fa-solid fa-bowl-food w-5 ${activeTab === "menu" ? "text-white" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Menu Items</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[500px]">
              {activeTab === "dashboard" && renderDashboardTab()}
              {activeTab === "orders" && renderOrdersTab()}
              {activeTab === "profile" && renderProfileTab()}
              {activeTab === "menu" && renderMenuTab()}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Logout Button */}
      <button 
        onClick={handleLogout}
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-brand-yellow px-6 py-3 rounded-full shadow-xl font-bold text-brand-dark hover:scale-105 active:scale-95 transition-all duration-200 group z-50 overflow-hidden"
      >
        <span className="relative z-10">Logout</span>
        <i className="fa-solid fa-right-from-bracket relative z-10"></i>
        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
      </button>
    </div>
  );
}

export default RestaurantDashboard;
