import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function DeliveryAgentDashboard() {
  const [dashboardData, setDashboardData] = useState({
    assignedOrder: null,
    totalEarnings: 0,
    isAvailable: false,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchHistory();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get("/delivery-agent/dashboard");
      setDashboardData(data);
      setTotalEarnings(data.totalEarnings || 0);
    } catch (error) {
      console.error("Error fetching dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await API.get("/delivery-agent/my-deliveries");
      setHistory(data);
      
      // Calculate today's earnings
      const today = new Date().toDateString();
      const todayTotal = data.reduce((sum, order) => {
        const orderDate = new Date(order.createdAt).toDateString();
        return (orderDate === today && order.status === "Completed") 
          ? sum + (order.agentEarning || 0) 
          : sum;
      }, 0);
      setTodayEarnings(todayTotal);
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/order/update/${orderId}`, { status });
      fetchDashboard();
      fetchHistory();
    } catch (error) {
      console.error("Update Status Error:", error);
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await API.put(`/delivery-agent/accept/${orderId}`);
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Error accepting order");
    }
  };

  const handleReject = async (orderId) => {
    try {
      await API.put(`/delivery-agent/reject/${orderId}`);
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting order");
    }
  };

  // Status transitions to match the "Initially Picked Up -> Then Delivered" flow
  const handlePickUp = async (orderId) => {
    await updateStatus(orderId, "Picked Up");
  };

  const handleDelivered = async (orderId) => {
    // Backend requires Out for Delivery before Completed
    try {
      await API.put(`/order/update/${orderId}`, { status: "Out for Delivery" });
      await API.put(`/order/update/${orderId}`, { status: "Completed" });
      fetchDashboard();
      fetchHistory();
    } catch (error) {
      alert("Error completing delivery");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><i className="fa-solid fa-spinner fa-spin text-4xl text-orange-500"></i></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-gray-900 leading-tight">Delivery Agent <span className="text-orange-500">Dashboard</span></h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleOnlineStatus}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
                {isOnline ? 'Online' : 'Offline'}
              </button>
            </div>
          </div>
          <button 
            onClick={() => navigate("/delivery-agent/profile")}
            className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 self-start md:self-auto"
          >
            <i className="fa-solid fa-user-gear"></i>
            Manage Profile
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-500 p-6 rounded-2xl shadow-lg shadow-orange-500/20 text-white">
              <p className="text-orange-100 font-bold uppercase tracking-wider text-xs mb-2">Earnings Breakdown</p>
              <div className="flex items-baseline gap-4">
                <h2 className="text-4xl font-black">₹{todayEarnings} <span className="text-sm font-normal text-orange-100 opacity-80">(Today)</span></h2>
                <h2 className="text-2xl font-black text-orange-100">₹{totalEarnings} <span className="text-xs font-normal opacity-80">(Total)</span></h2>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-2">Total Deliveries</p>
              <h2 className="text-4xl font-black text-gray-900">{history.length}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Current Order */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <i className="fa-solid fa-truck-fast text-orange-500"></i>
            Active Delivery
          </h3>

          {!isOnline ? (
            <div className="bg-white rounded-3xl p-16 border-2 border-red-100 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-power-off text-red-300 text-3xl"></i>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">You are offline</h4>
              <p className="text-gray-500">Turn on your status to start receiving orders.</p>
            </div>
          ) : dashboardData.assignedOrder ? (
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-xl shadow-orange-500/5 hover:border-orange-200 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Order ID #{dashboardData.assignedOrder._id.slice(-6)}</span>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Status</p>
                  <p className="text-2xl font-black text-gray-900">{dashboardData.assignedOrder.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Delivery Pay</p>
                  <p className="text-2xl font-black text-orange-500">₹{dashboardData.assignedOrder.agentEarning}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-5 rounded-2xl flex items-center gap-4 border border-gray-100">
                  <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
                    <i className="fa-solid fa-shop text-xl"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Pick up From</p>
                    <p className="font-bold text-gray-800 truncate">{dashboardData.assignedOrder.restaurant?.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium truncate">{dashboardData.assignedOrder.restaurant?.address}</p>
                    <p className="text-[11px] text-orange-600 font-black mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-phone"></i>
                      {dashboardData.assignedOrder.restaurant?.phone || dashboardData.assignedOrder.restaurant?.contactNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl flex items-center gap-4 border border-gray-100">
                  <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
                    <i className="fa-solid fa-location-arrow text-xl"></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Deliver To</p>
                    <p className="font-bold text-gray-800 truncate">{dashboardData.assignedOrder.customer?.name}</p>
                    <p className="text-[10px] text-orange-600 font-black italic mb-1">{dashboardData.assignedOrder.deliveryAddress || "Address details missing"}</p>
                    <p className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
                      <i className="fa-solid fa-phone"></i>
                      {dashboardData.assignedOrder.customer?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                {dashboardData.assignedOrder.status === "Assigned" && (
                  <>
                    <button
                      onClick={() => handlePickUp(dashboardData.assignedOrder._id)}
                      className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all flex-1 shadow-lg shadow-orange-500/30 uppercase tracking-widest text-xs"
                    >
                      Picked Up
                    </button>
                    <button
                      onClick={() => handleReject(dashboardData.assignedOrder._id)}
                      className="bg-red-50 text-red-500 px-8 py-4 rounded-2xl font-black hover:bg-red-100 transition-all flex-1 uppercase tracking-widest text-xs"
                    >
                      Reject Order
                    </button>
                  </>
                )}

                {(dashboardData.assignedOrder.status === "Picked Up" || dashboardData.assignedOrder.status === "Out for Delivery") && (
                  <button
                    onClick={() => handleDelivered(dashboardData.assignedOrder._id)}
                    className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 transition-all w-full flex items-center justify-center gap-3 shadow-lg shadow-green-600/30 uppercase tracking-widest text-xs"
                  >
                    <i className="fa-solid fa-circle-check"></i>
                    Delivered
                  </button>
                )}
              </div>
            </div>
          ) : pendingOrder ? (
            <div className="bg-white rounded-3xl p-8 border-2 border-orange-500 shadow-xl shadow-orange-500/10 animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">New Request</span>
                  <h4 className="text-2xl font-black text-gray-900">{pendingOrder.restaurant}</h4>
                  <p className="text-gray-500 text-sm font-bold flex items-center gap-2 mt-1">
                    <i className="fa-solid fa-route text-orange-500"></i>
                    {pendingOrder.distance} away
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Potential Pay</p>
                  <p className="text-3xl font-black text-orange-500">₹{pendingOrder.earnings}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleAccept(pendingOrder.id)}
                  className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 transition-all flex-1 shadow-lg shadow-green-600/20 uppercase tracking-widest text-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(pendingOrder.id)}
                  className="bg-red-50 text-red-500 px-8 py-4 rounded-2xl font-black hover:bg-red-100 transition-all flex-1 uppercase tracking-widest text-xs"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-300 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-clock text-gray-300 text-3xl"></i>
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Searching for Orders...</h4>
              <p className="text-gray-500">Waiting for new delivery requests to be assigned.</p>
            </div>
          )}
        </div>

        {/* History */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <i className="fa-solid fa-clock-rotate-left text-orange-500"></i>
            Past Deliveries
          </h3>
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="max-h-[600px] overflow-y-auto">
              {history.length > 0 ? (
                history.map((order) => (
                  <div key={order._id} className="p-5 border-b border-gray-50 hover:bg-orange-50/30 transition-all cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-black text-gray-900 mb-1 leading-none">#{order._id.slice(-6)}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border border-green-100">+₹{order.agentEarning}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-700 truncate mb-1">{order.restaurant?.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                      <span className={order.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}>{order.status}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400">{order.paymentStatus} ({order.paymentMethod})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No delivery history</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAgentDashboard;
