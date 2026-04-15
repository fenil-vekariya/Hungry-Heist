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
    } catch (error) {
      console.error("Error fetching history", error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await API.put("/delivery-agent/availability");
      setDashboardData({ ...dashboardData, isAvailable: data.isAvailable });
    } catch (error) {
      alert(error.response?.data?.message || "Error toggling availability");
    }
  };

  // Unified Status Update Call
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
      // In the unified logic, 'Picked Up' is the first status a partner sets himself
      // The assignment happens automatically in the backend. 
      // We keep handleAccept for 'Picked Up' or use the existing accept endpoint if it involves specific logic.
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

  if (loading) return <div className="flex justify-center items-center h-screen"><i className="fa-solid fa-spinner fa-spin text-4xl text-orange-500"></i></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Delivery Agent <span className="text-orange-500">Dashboard</span></h1>
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
              <p className="text-orange-100 font-bold uppercase tracking-wider text-xs mb-2">Total Earnings</p>
              <h2 className="text-4xl font-black">₹{history.reduce((sum, order) => sum + (order.status === "Completed" ? (order.agentEarning || 0) : 0), 0)}</h2>
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

          {dashboardData.assignedOrder ? (
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
                  </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl flex items-center gap-4 border border-gray-100">
                  <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
                    <i className="fa-solid fa-user text-xl"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none mb-1">Deliver To</p>
                    <p className="font-bold text-gray-800 truncate">{dashboardData.assignedOrder.customer?.name}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                {dashboardData.assignedOrder.status === "Assigned" && (
                  <>
                    <button
                      onClick={() => handleAccept(dashboardData.assignedOrder._id)}
                      className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all flex-1 shadow-lg shadow-orange-500/30 uppercase tracking-widest text-xs"
                    >
                      Accept Assignment
                    </button>
                    <button
                      onClick={() => handleReject(dashboardData.assignedOrder._id)}
                      className="bg-red-50 text-red-500 px-8 py-4 rounded-2xl font-black hover:bg-red-100 transition-all flex-1 uppercase tracking-widest text-xs"
                    >
                      Pass Order
                    </button>
                  </>
                )}

                {dashboardData.assignedOrder.status === "Picked Up" && (
                  <button
                    onClick={() => updateStatus(dashboardData.assignedOrder._id, "Out for Delivery")}
                    className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all w-full flex items-center justify-center gap-3 shadow-lg shadow-orange-500/30 uppercase tracking-widest text-xs"
                  >
                    <i className="fa-solid fa-location-dot"></i>
                    Start Delivery Journey
                  </button>
                )}

                {dashboardData.assignedOrder.status === "Out for Delivery" && (
                  <button
                    onClick={() => updateStatus(dashboardData.assignedOrder._id, "Completed")}
                    className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 transition-all w-full flex items-center justify-center gap-3 shadow-lg shadow-green-600/30 uppercase tracking-widest text-xs"
                  >
                    <i className="fa-solid fa-circle-check"></i>
                    Confirm Successful Delivery
                  </button>
                )}
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
