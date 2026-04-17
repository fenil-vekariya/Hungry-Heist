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

  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [feedback, setFeedback] = useState([]);
  const [reviews, setReviews] = useState([]);

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
    fetchDeliveryAgents();
    fetchPendingAgents();
    fetchReviews();
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

  const fetchDeliveryAgents = async () => {
    try {
      const res = await API.get("/admin/delivery-agents");
      setDeliveryAgents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPendingAgents = async () => {
    try {
      const res = await API.get("/admin/delivery-agents/pending");
      setPendingAgents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const approveAgent = async (id) => {
    try {
      await API.put(`/admin/delivery-agents/approve/${id}`);
      fetchPendingAgents();
      fetchDeliveryAgents();
    } catch (err) {
      console.log(err);
      setError("Failed to approve delivery agent.");
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

  const assignAgent = async (orderId) => {
    try {
      await API.post("/admin/delivery-agents/assign", { orderId });
      fetchOrders();
      alert("System initiated delivery agent assignment.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign delivery agent.");
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

  const fetchReviews = async () => {
    try {
      const res = await API.get("/reviews/admin");
      setReviews(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load reviews.");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await API.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.log(err);
      setError("Failed to delete review.");
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
      fetchRestaurants();
      fetchStats();
    } catch (err) {
      console.log(err);
      setError("Failed to approve restaurant.");
    }
  };

  const rejectRestaurant = async (id, isAccountOnly = false) => {
    const message = isAccountOnly 
      ? "Are you sure you want to REJECT and PERMANENTLY DELETE this owner account registration?"
      : "Are you sure you want to REJECT and PERMANENTLY DELETE this restaurant profile?";
      
    if (!window.confirm(message)) return;
    try {
      if (isAccountOnly) {
        await API.delete(`/admin/user/${id}`);
      } else {
        await API.delete(`/admin/restaurant/${id}`);
      }
      fetchPendingRestaurants();
      fetchRestaurants();
      fetchStats();
    } catch (err) {
      console.log(err);
      setError("Failed to reject and delete application.");
    }
  };

  const approveUser = async (id) => {
    try {
      await API.put(`/admin/approve-user/${id}`);
      fetchUsers();
      fetchStats();
      alert("User account approved!");
    } catch (err) {
      console.log(err);
      setError("Failed to approve user account.");
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
      fetchDeliveryAgents();
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

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await API.delete(`/feedback/${id}`);
      setFeedback((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.log(err);
      setError("Failed to delete feedback.");
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">{stats.totalUsers}</h3>
                </div>
                <div className="w-10 h-10 bg-brand-orange/5 text-brand-orange rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-users"></i>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Restaurants</p>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">{stats.totalRestaurants}</h3>
                </div>
                <div className="w-10 h-10 bg-brand-orange/5 text-brand-orange rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-utensils"></i>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">{stats.totalOrders}</h3>
                </div>
                <div className="w-10 h-10 bg-brand-orange/5 text-brand-orange rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-receipt"></i>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenue</p>
                  <h3 className="text-2xl font-black text-brand-orange">₹{stats.totalRevenue}</h3>
                </div>
                <div className="w-10 h-10 bg-brand-orange/5 text-brand-orange rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Agents</p>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">{deliveryAgents.length}</h3>
                </div>
                <div className="w-10 h-10 bg-brand-orange/5 text-brand-orange rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-motorcycle"></i>
                </div>
              </div>
            </div>

          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant Queue */}
          <div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-store text-brand-orange"></i>
              Restaurant Queue ({pendingRestaurants.length})
            </h3>
            <div className="space-y-3">
              {pendingRestaurants.length === 0 ? (
                <p className="text-sm text-gray-400 italic bg-white p-4 rounded-xl border border-dashed border-gray-100">No pending restaurants</p>
              ) : pendingRestaurants.map(rest => (
                <div key={rest._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-700 block">
                      {rest.isAccountOnly ? `Account: ${rest.owner?.name || 'New Registration'}` : (rest.name || 'Unnamed Restaurant')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {rest.isAccountOnly ? "Pending Owner Approval" : `Owner: ${rest.owner?.name || 'N/A'}`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveRestaurant(rest._id)} className="p-1 px-3 bg-green-500 text-white text-[10px] font-black rounded-lg uppercase">Approve</button>
                    <button onClick={() => rejectRestaurant(rest._id, rest.isAccountOnly)} className="p-1 px-3 bg-red-50 text-red-500 text-[10px] font-black rounded-lg uppercase">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Agent Queue */}
          <div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-motorcycle text-brand-orange"></i>
              Delivery Agent Queue ({pendingAgents.length})
            </h3>
            <div className="space-y-3">
              {pendingAgents.length === 0 ? (
                <p className="text-sm text-gray-400 italic bg-white p-4 rounded-xl border border-dashed border-gray-100">No pending delivery agents</p>
              ) : pendingAgents.map(user => (
                <div key={user._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 leading-none">{user.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{user.vehicleType} - {user.vehicleNumber}</p>
                  </div>
                  <button onClick={() => approveAgent(user._id)} className="p-1 px-3 bg-brand-orange text-white text-[10px] font-black rounded-lg uppercase">Approve</button>
                </div>
              ))}
            </div>
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
                {(!user.isApproved && (user.role === "restaurant" || user.role === "partner")) && (
                  <button
                    onClick={() => approveUser(user._id)}
                    className="flex-1 py-2 bg-brand-orange text-white rounded-xl text-xs font-black shadow-sm shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all uppercase"
                  >
                    Approve Account
                  </button>
                )}
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
                <div className="flex flex-col items-end gap-2">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-orange/5 group-hover:text-brand-orange transition-colors">
                    <i className="fa-solid fa-store"></i>
                  </div>
                  {rest.isApproved ? (
                    <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Approved
                    </span>
                  ) : (
                    <span className="bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-yellow-100 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Owner Information</p>
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
                Terminate Registration
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

  const renderAgentsTab = () => {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4 flex items-center gap-2">
          <i className="fa-solid fa-motorcycle text-brand-orange text-sm"></i>
          Delivery Agents
        </h2>

        {pendingAgents.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Pending Approval ({pendingAgents.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAgents.map(p => (
                <div key={p._id} className="bg-white p-5 rounded-2xl border-2 border-orange-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-gray-800">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{p.vehicleType} • {p.vehicleNumber}</p>
                  </div>
                  <button onClick={() => approveAgent(p._id)} className="bg-brand-orange text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-brand-orange/20">Approve</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryAgents.map((agent) => (
            <div key={agent._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-orange/5 group-hover:text-brand-orange transition-colors">
                  <i className="fa-solid fa-person-biking text-xl"></i>
                </div>
              </div>
              <h4 className="text-lg font-black text-gray-800 mb-1">{agent.name}</h4>
              <p className="text-xs text-gray-400 font-medium mb-4">{agent.email}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Earnings</p>
                  <p className="text-sm font-black text-gray-700">₹{agent.totalEarnings}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Vehicle</p>
                  <p className="text-[10px] font-bold text-gray-700 truncate px-1">{agent.vehicleNumber}</p>
                </div>
              </div>

              <button
                onClick={() => handleToggleBlockUser(agent._id)}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${agent.isBlocked ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400 hover:bg-red-500 hover:text-white"}`}
              >
                {agent.isBlocked ? "Unblock Agent" : "Restrict Access"}
              </button>
            </div>
          ))}
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
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${order.status === "Pending" ? "bg-amber-50 text-amber-600" :
                    order.status === "Accepted" ? "bg-teal-50 text-teal-600" :
                    order.status === "Completed" ? "bg-green-50 text-green-600" :
                    order.status === "Ready" ? "bg-purple-100 text-purple-600" :
                    order.status === "Assigned" ? "bg-indigo-100 text-indigo-600" :
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

              {order.deliveryAgent && (
                <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-motorcycle text-indigo-500"></i>
                    <div>
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Assigned Agent</p>
                      <p className="text-[10px] font-bold text-indigo-900">{order.deliveryAgent.name}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-indigo-400 bg-white px-2 py-0.5 rounded-full border border-indigo-50">EARNED: ₹{order.agentEarning}</span>
                </div>
              )}

              {["Accepted", "Preparing", "Ready"].includes(order.status) && !order.deliveryAgent && (
                <button
                  onClick={() => assignAgent(order._id)}
                  className="w-full mb-6 py-3 bg-brand-orange text-white rounded-xl text-[10px] font-black shadow-lg shadow-brand-orange/20 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-robot"></i>
                  Manually Assign Agent
                </button>
              )}

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

  const renderReviewsTab = () => {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 border-b border-gray-100 pb-4">Order Reviews Moderation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-black">
                    {review.customer?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800">{review.customer?.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">At {review.restaurant?.name}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa-solid fa-star text-[10px] ${i < review.rating ? "text-brand-yellow" : "text-gray-100"}`}></i>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50 mb-4">
                <p className="text-sm text-gray-600 leading-relaxed italic">"{review.comment}"</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-400 font-medium uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                <button
                  onClick={() => deleteReview(review._id)}
                  className="text-red-400 hover:text-red-600 transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <i className="fa-solid fa-trash-can text-[10px]"></i> Delete
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              No order reviews found.
            </div>
          )}
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
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 font-medium uppercase">{new Date(item.createdAt).toLocaleDateString()}</p>
                <button
                  onClick={() => handleDeleteFeedback(item._id)}
                  className="text-red-400 hover:text-red-600 transition-colors text-xs font-bold flex items-center gap-1"
                  title="Delete Feedback"
                >
                  <i className="fa-solid fa-trash-can text-[10px]"></i> Delete
                </button>
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
    <div className="min-h-screen bg-gray-50 pt-4 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm rounded-2xl mb-4 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-brand-orange/10 p-2.5 rounded-xl text-brand-orange">
              <i className="fa-solid fa-user-shield text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 leading-none">Admin Panel</h1>
              <div className="flex gap-2 items-center mt-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Hungry Heist Control</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* User profile section removed */}
          </div>
        </nav>
        {error && <p className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2 animate-fade-in"><i className="fa-solid fa-circle-exclamation"></i> {error}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-20">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">Management</p>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "dashboard" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("dashboard")}>
                <i className={`fa-solid fa-chart-pie w-5 ${activeTab === "dashboard" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Dashboard</span>
              </button>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "users" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("users")}>
                <i className={`fa-solid fa-users w-5 ${activeTab === "users" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Users</span>
              </button>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "restaurants" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("restaurants")}>
                <i className={`fa-solid fa-store w-5 ${activeTab === "restaurants" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Restaurants</span>
              </button>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "deliveryAgents" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("deliveryAgents")}>
                <i className={`fa-solid fa-motorcycle w-5 ${activeTab === "deliveryAgents" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Delivery Agents</span>
              </button>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "orders" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("orders")}>
                <i className={`fa-solid fa-bag-shopping w-5 ${activeTab === "orders" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Orders</span>
              </button>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "categories" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("categories")}>
                <i className={`fa-solid fa-list-check w-5 ${activeTab === "categories" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Categories</span>
              </button>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "feedback" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("feedback")}>
                <i className={`fa-solid fa-comments w-5 ${activeTab === "feedback" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Feedback</span>
              </button>
              <button className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "reviews" ? "bg-orange-100 text-brand-orange font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} onClick={() => setActiveTab("reviews")}>
                <i className={`fa-solid fa-star w-5 ${activeTab === "reviews" ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Reviews</span>
              </button>
            </div>
          </aside>
          <main className="lg:col-span-3">
            <div className="min-h-[600px] animate-fade-in">
              {activeTab === "dashboard" && renderDashboardTab()}
              {activeTab === "users" && renderUsersTab()}
              {activeTab === "restaurants" && renderRestaurantsTab()}
              {activeTab === "deliveryAgents" && renderAgentsTab()}
              {activeTab === "orders" && renderOrdersTab()}
              {activeTab === "categories" && renderCategoriesTab()}
              {activeTab === "feedback" && renderFeedbackTab()}
              {activeTab === "reviews" && renderReviewsTab()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
