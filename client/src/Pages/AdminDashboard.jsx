import { useEffect, useState } from "react";
import API from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";

function AdminDashboard() {
  
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState(null);

  const [users, setUsers] = useState([]);

  const [restaurants, setRestaurants] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);

  const [orders, setOrders] = useState([]);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [feedback, setFeedback] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
    fetchPendingRestaurants();
    fetchRestaurants();
    fetchUsers();
    fetchOrders();
    fetchCategories();
    fetchFeedback();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load dashboard stats.");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.filter(user => user.role.toLowerCase() !== "admin"));
    } catch (err) {
      console.log(err);
      setError("Failed to load users.");
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await API.get("/admin/restaurants");
      setRestaurants(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load restaurants.");
    }
  };

  const fetchPendingRestaurants = async () => {
    try {
      const res = await API.get("/admin/pending");
      setPendingRestaurants(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load pending restaurants.");
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");
      setCategories(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load categories.");
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await API.get("/feedback");
      setFeedback(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load feedback.");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setLoading(true);
      await API.post("/category/add", { name: newCategoryName });
      setNewCategoryName("");
      fetchCategories();
    } catch (err) {
      console.log(err);
      if (err.response) {
        setError(`Server Error ${err.response.status}: ${err.response.data.message || 'No message provided by backend.'}`);
      } else {
        setError(`Network Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/category/delete/${id}`);
      fetchCategories();
    } catch (err) {
      console.log(err);
      setError("Failed to delete category.");
    }
  };

  const approveRestaurant = async (id) => {
    try {
      await API.put(`/admin/approve/${id}`);
      fetchPendingRestaurants();
    } catch (err) {
      console.log(err);
      setError("Failed to approve restaurant.");
    }
  };

  const rejectRestaurant = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT and PERMANENTLY DELETE this restaurant application?")) return;
    try {
      await API.delete(`/admin/user/${id}`);
      fetchPendingRestaurants();
    } catch (err) {
      console.log(err);
      setError("Failed to reject and delete application.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await API.delete(`/admin/user/${id}`);
      fetchUsers();
    } catch (err) {
      console.log(err);
      setError("Failed to delete user.");
    }
  };

  const handleToggleBlockUser = async (id) => {
    try {
      await API.put(`/admin/block/${id}`);
      fetchUsers();
    } catch (err) {
      console.log(err);
      setError("Failed to update user block status.");
    }
  };

  const handleDeleteRestaurant = async (id) => {
    try {
      if (!window.confirm("Delete this restaurant?")) return;
      await API.delete(`/admin/restaurant/${id}`);
      fetchRestaurants();
    } catch (err) {
      console.log(err);
      setError("Failed to delete restaurant.");
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this order?")) return;
      await API.delete(`/admin/order/${id}`);
      fetchOrders();
    } catch (err) {
      console.log(err);
      setError("Failed to delete order.");
    }
  };

  const renderDashboardTab = () => {
    return (
      <div className="space-y-10 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-gauge-high text-brand-orange text-xl"></i>
            System Overview
          </h2>
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">{stats.totalUsers}</h3>
                <div className="mt-4 flex items-center gap-1.5 text-green-500">
                  <i className="fa-solid fa-arrow-up text-[10px]"></i>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Active Growth</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Restaurants</p>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">{stats.totalRestaurants}</h3>
                <div className="mt-4 flex items-center gap-1.5 text-brand-orange">
                  <i className="fa-solid fa-store text-[10px]"></i>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Partnerships</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">{stats.totalOrders}</h3>
                <div className="mt-4 flex items-center gap-1.5 text-blue-500">
                  <i className="fa-solid fa-receipt text-[10px]"></i>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Completed</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenue</p>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">₹{stats.totalRevenue}</h3>
                <div className="mt-4 flex items-center gap-1.5 text-brand-yellow">
                  <i className="fa-solid fa-wallet text-[10px]"></i>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Gross Earnings</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-brand-orange text-sm"></i>
            Registration Queue
          </h3>
          <div className="space-y-4">
            {pendingRestaurants.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-100 text-center">
                <i className="fa-solid fa-circle-check text-4xl text-gray-200 mb-3"></i>
                <p className="text-gray-400 font-medium">All applications have been processed.</p>
              </div>
            ) : pendingRestaurants.map((user) => (
              <div key={user._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-orange/5 group-hover:text-brand-orange transition-colors">
                    <i className="fa-solid fa-building-circle-exclamation text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-800">{user.name}</h4>
                    <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-black uppercase tracking-widest border border-amber-100">Pending Approval</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => rejectRestaurant(user._id)}
                    className="px-6 py-2.5 bg-red-50 text-red-500 rounded-full text-xs font-black border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-xmark"></i>
                    Reject
                  </button>
                  <button 
                    onClick={() => approveRestaurant(user._id)}
                    className="px-6 py-2.5 bg-brand-orange text-white rounded-full text-xs font-black shadow-lg shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-check"></i>
                    Approve Application
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4">Manage Platform Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-brand-orange/5 rounded-xl flex items-center justify-center text-brand-orange text-lg font-black shadow-inner uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-800 group-hover:text-brand-orange transition-colors">{user.name}</h4>
                    <p className="text-xs text-gray-400 font-medium tracking-tight uppercase">{user.role}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.isBlocked ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <i className="fa-regular fa-envelope text-gray-300 w-4"></i>
                  <span className="text-gray-600 font-medium">{user.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                <button
                  onClick={() => handleToggleBlockUser(user._id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${user.isBlocked ? "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white" : "bg-gray-50 text-gray-600 hover:bg-red-600 hover:text-white"}`}
                >
                  {user.isBlocked ? "Unblock Account" : "Block Access"}
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="px-4 py-2 bg-red-50 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all border border-red-100"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRestaurantsTab = () => {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4 flex items-center gap-2">
          <i className="fa-solid fa-utensils text-brand-orange text-sm"></i>
          Registered Restaurants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurants.map((rest) => (
            <div key={rest._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-black text-gray-800 mb-1 group-hover:text-brand-orange transition-colors">{rest.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fa-solid fa-key text-[8px]"></i> ID: {rest._id.slice(-6)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-orange/5 group-hover:text-brand-orange transition-colors">
                  <i className="fa-solid fa-store"></i>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Owner Information</p>
                  <p className="text-sm font-bold text-gray-700">{rest.owner?.name}</p>
                  <p className="text-xs text-gray-500">{rest.owner?.email}</p>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Volume</span>
                  <span className="text-sm font-black text-brand-orange">{rest.totalOrders} Orders</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteRestaurant(rest._id)}
                className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all border border-red-100 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-trash-can"></i>
                Terminate Partnership
              </button>
            </div>
          ))}
          {restaurants.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400">
              No restaurants found in the database.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOrdersTab = () => {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4">Platform Orders</h2>
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 flex items-center gap-2 animate-pulse">
            <i className="fa-solid fa-spinner fa-spin text-sm"></i> Syncing platform transactions...
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transaction ID</p>
                  <p className="text-xs font-mono font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded inline-block">#{order._id.slice(-8)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  order.status === "Pending" ? "bg-amber-50 text-amber-600" :
                  order.status === "Completed" ? "bg-green-50 text-green-600" :
                  "bg-blue-50 text-blue-600"
                }`}>
                  {order.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-xs font-bold text-gray-700 truncate">{order.customer?.name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Restaurant</p>
                  <p className="text-xs font-bold text-gray-700 truncate">{order.restaurant?.name}</p>
                </div>
              </div>

              <div className="space-y-2 mb-8 border-b border-gray-50 pb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Amount</span>
                  <span className="text-brand-orange font-black">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Payment</span>
                  <span className="text-gray-700 font-bold italic">{order.paymentStatus}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{new Date(order.createdAt).toLocaleString()}</p>
                <button 
                  onClick={() => handleDeleteOrder(order._id)}
                  className="p-2 text-red-300 hover:text-red-500 transition-colors"
                  title="Delete Transaction Record"
                >
                  <i className="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400">
              No orders have been recorded yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCategoriesTab = () => {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4">Content Management</h2>

        <div className="bg-brand-orange shadow-lg shadow-brand-orange/10 rounded-2xl p-6 sm:p-8 mb-12 text-white overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <i className="fa-solid fa-plus-circle"></i> Create New Food Category
            </h3>
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="e.g. Italian, Desserts, Vegan..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white focus:text-gray-800 rounded-xl px-4 py-3 outline-none transition-all"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-white text-brand-orange font-black px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Register Category"}
              </button>
            </form>
          </div>
          {/* Bg Decor */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <h3 className="text-lg font-black text-gray-800 mb-6 px-1">Active Platform Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-orange/5 text-brand-orange flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-tags"></i>
                </div>
                <span className="font-bold text-gray-700 leading-none">{cat.name}</span>
              </div>
              <button 
                onClick={() => handleDeleteCategory(cat._id)}
                className="w-8 h-8 rounded-lg text-red-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="col-span-full py-12 text-center text-gray-400 font-medium">No categories currently active.</p>}
        </div>
      </div>
    );
  };

  const renderFeedbackTab = () => {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4">User Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedback.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-yellow/10 text-brand-yellow rounded-xl flex items-center justify-center font-black">
                    {item.user?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800 truncate max-w-[120px]">{item.user}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic line-clamp-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa-solid fa-star text-[10px] ${i < item.rating ? "text-brand-yellow" : "text-gray-100"}`}></i>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50 mb-2">
                <p className="text-sm text-gray-600 leading-relaxed italic">"{item.message}"</p>
              </div>
            </div>
          ))}
          {feedback.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400">
              No user reviews available yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Dashboard Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm rounded-2xl mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-brand-orange/10 p-2.5 rounded-xl text-brand-orange">
              <i className="fa-solid fa-user-shield text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 leading-none">Admin Panel</h1>
              <div className="flex gap-2 items-center mt-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Hungry Heist Control</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-[10px] text-brand-orange uppercase tracking-widest font-bold">Secure Access</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-sm font-bold text-gray-700">Root Administrator</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">System Superuser</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-orange-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-brand-orange/20 border-2 border-white">
              A
            </div>
          </div>
        </nav>

        {error && <p className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2 animate-fade-in"><i className="fa-solid fa-circle-exclamation"></i> {error}</p>}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">Management</p>
              
              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "dashboard" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("dashboard")}
              >
                <i className={`fa-solid fa-chart-pie w-5 ${activeTab === "dashboard" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Dashboard</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "users" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("users")}
              >
                <i className={`fa-solid fa-users w-5 ${activeTab === "users" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Users</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "restaurants" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("restaurants")}
              >
                <i className={`fa-solid fa-store w-5 ${activeTab === "restaurants" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Restaurants</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "orders" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("orders")}
              >
                <i className={`fa-solid fa-bag-shopping w-5 ${activeTab === "orders" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Orders</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "categories" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("categories")}
              >
                <i className={`fa-solid fa-list-check w-5 ${activeTab === "categories" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Categories</span>
              </button>

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "feedback" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("feedback")}
              >
                <i className={`fa-solid fa-comments w-5 ${activeTab === "feedback" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Feedback</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            <div className="min-h-[600px] animate-fade-in">
              {activeTab === "dashboard" && renderDashboardTab()}
              {activeTab === "users" && renderUsersTab()}
              {activeTab === "restaurants" && renderRestaurantsTab()}
              {activeTab === "orders" && renderOrdersTab()}
              {activeTab === "categories" && renderCategoriesTab()}
              {activeTab === "feedback" && renderFeedbackTab()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );

}

export default AdminDashboard;
