import { useEffect, useState } from "react";
import API, { getBackendURL } from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import CancelOrderModal from "../components/CancelOrderModal";
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
  const [revenue, setRevenue] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);

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
  const [editingItemId, setEditingItemId] = useState(null);

  const [categories, setCategories] = useState([]);

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchRevenue();
    fetchMenu();
    fetchCategories();
    fetchReviews();

    const interval = setInterval(() => {
      fetchOrders();
      fetchRevenue();
    }, 15000);

    return () => clearInterval(interval);
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

  const [completedCount, setCompletedCount] = useState(0);

  const fetchRevenue = async () => {
    try {
      const res = await API.get("/restaurant/earnings");
      setRevenue(res.data.totalRevenue);
      setCompletedCount(res.data.completedCount || 0);
    } catch (err) {
      console.log(err);
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

  const fetchReviews = async () => {
    try {
      if (profile && profile._id) {
        const res = await API.get(`/reviews/restaurant/${profile._id}`);
        setReviews(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Profile data sync
  useEffect(() => {
    if (profile && profile._id) {
      fetchReviews();
    }
  }, [profile]);

  const handleEditClick = (item) => {
    setEditingItemId(item._id);
    setMenuData({
      name: item.name,
      price: item.price,
      description: item.description || "",
      category: item.category
    });
    setMenuImg(null);
    // Scroll to the top of the menu tab where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setMenuData({ name: "", price: "", description: "", category: categories[0]?.name || "Veg" });
    setMenuImg(null);
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

      if (editingItemId) {
        await API.put(`/menu/update/${editingItemId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccessMsg("Menu item updated successfully!");
      } else {
        await API.post("/menu/add", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccessMsg("Menu item added successfully!");
      }

      setMenuData({ name: "", price: "", description: "", category: categories[0]?.name || "Veg" });
      setMenuImg(null);
      setEditingItemId(null);
      fetchMenu();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || err.message || `Failed to ${editingItemId ? 'update' : 'add'} menu item.`);
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

  const updateOrderStatus = async (id, status, reason = "") => {
    try {
      setUpdating(true);
      await API.put(`/order/update/${id}`, { status, reason });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatuses = (current) => {
    if (current === "Pending") return ["Accepted"];
    if (current === "Accepted") return ["Preparing"];
    if (current === "Preparing") return ["Ready"];
    return [];
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderDashboardTab = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
          <h1 className="text-4xl font-black text-brand-orange mb-1">{orders.length}</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
          <h1 className="text-4xl font-black text-brand-orange mb-1">{formatPrice(revenue)}</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Revenue</p>
          {completedCount > 0 && <p className="text-[10px] text-green-500 font-bold mt-1">From {completedCount} Completed Orders</p>}
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
        ) : (Array.isArray(orders) ? orders : []).map((order) => {
          const nextStatuses = getNextStatuses(order?.status);
          return (
            <div key={order._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full ring-1 ring-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-lg font-bold text-gray-800">{order.customer?.name}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  order.status === "Pending" ? "bg-amber-100 text-amber-600" :
                  order.status === "Accepted" ? "bg-teal-100 text-teal-600" :
                  order.status === "Preparing" ? "bg-blue-100 text-blue-600" :
                  order.status === "Ready" ? "bg-purple-100 text-purple-600" :
                  order.status === "Assigned" ? "bg-indigo-100 text-indigo-600" :
                  order.status === "Completed" ? "bg-green-100 text-green-600" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {order.status}
                </div>
              </div>

              {order.status === "Cancelled" && order.cancellationReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Cancellation Reason</p>
                  <p className="text-[11px] font-bold text-red-700 leading-tight">“ {order.cancellationReason} ”</p>
                </div>
              )}

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex justify-between text-sm group">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="text-gray-800 font-mono text-[10px] bg-gray-50 p-1 rounded">#{order._id.slice(-6)}</span>
                </div>

                {order.status === "Pending" && (
                  <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-bold border border-amber-100 flex items-center gap-2">
                    <i className="fa-solid fa-bell"></i>
                    New order waiting for your confirmation!
                  </div>
                )}
                {order.status === "Accepted" && (
                  <div className="bg-teal-50 text-teal-700 p-3 rounded-xl text-xs font-bold border border-teal-100 flex items-center gap-2">
                    <i className="fa-solid fa-check-circle"></i>
                    You've accepted the order. Mark it as 'Preparing' when you begin cooking.
                  </div>
                )}
                {order.status === "Preparing" && (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-xs font-bold border border-blue-100 flex items-center gap-2">
                    <i className="fa-solid fa-fire-burner"></i>
                    Order is in the kitchen. Mark as 'Ready' once packed.
                  </div>
                )}
                {order.status === "Ready" && !order.deliveryAgent && (
                  <div className="bg-purple-50 text-purple-700 p-3 rounded-xl text-xs font-bold border border-purple-100 animate-pulse flex items-center gap-2">
                    <i className="fa-solid fa-robot"></i>
                    Order marked as Ready. System is assigning a delivery agent.
                  </div>
                )}
                {order.deliveryAgent && (
                  <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl border border-indigo-100 flex items-center group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm shadow-sm ring-4 ring-indigo-500/10">
                        <i className="fa-solid fa-motorcycle"></i>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-widest font-black opacity-60">Agent Assigned</p>
                        <p className="font-black text-sm">{order.deliveryAgent.name}</p>
                        <p className="text-[10px] font-bold mt-0.5 flex items-center gap-1">
                          <i className="fa-solid fa-phone text-[8px]"></i>
                          {order.deliveryAgent.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
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
                      className="flex-1 px-4 py-3 bg-brand-orange text-white rounded-xl text-xs font-black shadow-lg shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      {status === "Accepted" ? "Accept Order" : 
                       status === "Preparing" ? "Mark as Preparing" : 
                       status === "Ready" ? "Mark as Ready" : 
                       `Process: ${status}`}
                    </button>
                  ))}

                  {/* Restaurant Rejection Control */}
                  {["Pending", "Accepted", "Preparing", "Ready"].includes(order.status) && (
                    <button 
                      onClick={() => {
                        setSelectedOrderForCancel(order);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-3 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-red-100 transition-all flex items-center justify-center gap-2"
                      title="Reject Order"
                    >
                      <i className="fa-solid fa-ban"></i>
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderProfileTab = () => {
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
                <img 
                  src={profile.image.startsWith("http") ? profile.image : `${getBackendURL()}/${profile.image.replace(/\\/g, '/')}`} 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/e2e8f0/1e293b?text=${encodeURIComponent(profile?.name || "Restaurant")}`; }} 
                  alt="Logo" 
                  className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white" 
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-brand-orange/10 flex items-center justify-center text-brand-orange text-4xl font-black shadow-inner">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "R"}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-black text-gray-800 mb-2">{profile?.name || "Restaurant"}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xl">{profile?.description || ""}</p>
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

  const renderReviewsTab = () => (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Customer Reviews</h2>
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <i className="fa-solid fa-star-half-stroke text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-medium tracking-tight">No reviews yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-gray-800">{review.customer?.name || "Customer"}</p>
                  <p className="text-[10px] text-gray-400 uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i 
                      key={star} 
                      className={`fa-solid fa-star text-xs ${star <= review.rating ? "text-brand-yellow" : "text-gray-200"}`}
                    ></i>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMenuTab = () => (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-extrabold text-gray-800">Manage Menu</h2>
        <div className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{menuItems.length} Items Listed</div>
      </div>

      {/* Add New Item Form Section */}
      <div className="bg-white shadow-xl shadow-gray-100 rounded-3xl p-6 sm:p-10 mb-12 border border-gray-100 overflow-hidden relative group">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-800">
            <i className={`fa-solid ${editingItemId ? 'fa-pen-to-square' : 'fa-plus-circle'} text-brand-orange`}></i> 
            {editingItemId ? `Edit Menu Item: ${menuData.name}` : 'Add New Menu Item'}
          </h3>
          <form onSubmit={handleMenuSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Item Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Paneer Tikka" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 rounded-2xl px-5 py-4 outline-none transition-all" 
                value={menuData.name} 
                onChange={(e) => setMenuData({ ...menuData, name: e.target.value })} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Price (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  placeholder="99" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 rounded-2xl px-5 py-4 outline-none transition-all" 
                  value={menuData.price} 
                  onChange={(e) => setMenuData({ ...menuData, price: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Category</label>
                <select 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 rounded-2xl px-5 py-4 outline-none transition-all cursor-pointer appearance-none" 
                  value={menuData.category} 
                  onChange={(e) => setMenuData({ ...menuData, category: e.target.value })}
                >
                  {categories.map((cat) => <option key={cat._id} value={cat.name} className="text-gray-800">{cat.name}</option>)}
                  {categories.length === 0 && <option value="Veg">Veg</option>}
                </select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Food Image</label>
              <div className="relative group/file">
                <input 
                  type="file" 
                  accept="image/*" 
                  required={!editingItemId}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-brand-orange/10 file:text-brand-orange hover:file:bg-brand-orange/20 cursor-pointer bg-gray-50 border border-gray-200 rounded-2xl p-2 transition-all mt-1" 
                  onChange={(e) => setMenuImg(e.target.files[0])} 
                />
              </div>
              {editingItemId && <p className="text-[9px] text-gray-400 mt-1 px-1 font-bold uppercase tracking-tighter">* Leave empty to keep official item image</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Description (Optional)</label>
              <textarea 
                placeholder="Tell your customers what makes this dish special..." 
                rows="3" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 rounded-2xl px-5 py-4 outline-none transition-all" 
                value={menuData.description} 
                onChange={(e) => setMenuData({ ...menuData, description: e.target.value })} 
              />
            </div>

            <div className="md:col-span-2 pt-4 flex gap-4">
              {editingItemId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-100 text-gray-600 font-black py-5 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
                >
                  Cancel Edit
                </button>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-[2] bg-brand-orange text-white font-black py-5 rounded-2xl shadow-lg shadow-brand-orange/20 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <i className="fa-solid fa-spinner fa-spin"></i> {editingItemId ? 'Updating' : 'Adding'} Item...
                  </span>
                ) : (
                  editingItemId ? "Update Menu Item" : "Add to Restaurant Menu"
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-gray-100/50 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
      </div>


      <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
        <i className="fa-solid fa-list-ul text-brand-orange text-sm"></i> Your Active Menu Items
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(menuItems) ? menuItems : []).map((item) => (
          <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="h-40 overflow-hidden relative">
              {item.image ? (
                <img 
                  src={item.image.startsWith("http") ? item.image : `${getBackendURL()}/${item.image.replace(/\\/g, '/')}`} 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/e2e8f0/1e293b?text=${encodeURIComponent(item.name)}`; }} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <img 
                  src={`https://placehold.co/400x300/e2e8f0/1e293b?text=${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
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
              <p className="text-xs text-gray-500 line-clamp-2 mb-6 h-8">{item.description}</p>
              
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => handleEditClick(item)}
                  className="flex-1 py-2.5 text-xs font-bold text-brand-orange bg-brand-orange/5 hover:bg-brand-orange hover:text-white rounded-xl transition-all border border-brand-orange/10"
                >
                  <i className="fa-solid fa-pen-to-square mr-2"></i> Edit
                </button>
                <button 
                  onClick={() => handleDeleteMenu(item._id)}
                  className="flex-1 py-2.5 text-xs font-bold text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100"
                >
                  <i className="fa-solid fa-trash-can mr-2"></i> Remove
                </button>
              </div>
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
    <div className="min-h-screen bg-gray-50 pt-4 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 shadow-sm bg-white rounded-2xl mb-4 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-brand-orange/10 p-2 rounded-xl text-brand-orange">
              <i className="fa-solid fa-store text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">{profile?.name || "My Restaurant"}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">Restaurant Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* User profile section removed */}
          </div>
        </nav>

        {error && <p className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2"><i className="fa-solid fa-circle-exclamation"></i> {error}</p>}
        {successMsg && <p className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100 flex items-center gap-2"><i className="fa-solid fa-circle-check"></i> {successMsg}</p>}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-20">
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

              <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === "reviews" ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"}`} 
                onClick={() => setActiveTab("reviews")}
              >
                <i className={`fa-solid fa-star w-5 ${activeTab === "reviews" ? "text-white" : "text-gray-400 group-hover:text-brand-orange"}`}></i>
                <span>Reviews</span>
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
              {activeTab === "reviews" && renderReviewsTab()}
            </div>
          </main>
        </div>
      </div>

      {showCancelModal && selectedOrderForCancel && (
        <CancelOrderModal 
          order={selectedOrderForCancel}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrderForCancel(null);
          }}
          onSuccess={(id, reason) => updateOrderStatus(id, "Cancelled", reason)}
          role="restaurant"
        />
      )}

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
