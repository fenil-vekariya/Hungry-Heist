import { useEffect, useState } from "react";
import API from "../services/api";
import Card from "../components/Card";
import { formatPrice, formatDate } from "../utils/formatters";
import ReviewModal from "../components/ReviewModal";
import Button from "../components/Button";
import CancelOrderModal from "../components/CancelOrderModal";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/order/my");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, reason) => {
    try {
      setCancelling(true);
      await API.put(`/order/update/${orderId}`, { status: "Cancelled", reason });
      alert("Order cancelled successfully.");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="pt-4 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50/30">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My <span className="text-orange-500">Orders</span></h1>
          <p className="text-gray-400 font-medium text-sm mt-1">Track and manage your hunger quests.</p>
        </div>
        <button onClick={fetchOrders} className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all shadow-sm">
          <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 border border-red-100 animate-fade-in">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      <div className="space-y-8">
        {orders.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200 text-3xl">
              <i className="fa-solid fa-box-open"></i>
            </div>
            <p className="text-gray-500 font-bold text-lg">Your order box is empty!</p>
            <p className="text-gray-400 text-sm mt-1">Hungry? Let's fix that.</p>
          </div>
        )}

        {orders.map((order) => (
          <Card 
            key={order._id} 
            className="p-0 border-none shadow-premium hover:translate-y-[-4px] transition-all duration-500 overflow-hidden"
          >
            <div className="flex flex-col">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">
                         {order.restaurant?.name?.charAt(0) || "H"}
                       </div>
                       <div>
                         <h3 className="text-2xl font-black text-gray-900 leading-tight">{order.restaurant?.name || "Hungry Heist"}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                            {order.deliveryAddress && order.deliveryAddress.trim() !== "" && (
                              <>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <p className="text-[10px] font-bold text-orange-500/70 flex items-center gap-1">
                                  <i className="fa-solid fa-location-dot"></i> {order.deliveryAddress}
                                </p>
                              </>
                            )}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Middle Section */}
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${
                      order.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-500 border-red-100' :
                      order.status === 'Accepted' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {order.status}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-1.5 rounded-2xl border-2 border-gray-100">
                      {order.paymentMethod} • <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}>{order.paymentStatus}</span>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="text-right flex flex-col items-end gap-3 min-w-[120px]">
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">{formatPrice(order.totalAmount)}</p>
                    
                    {/* Premium Cancellation Control */}
                    {(order.status === "Pending" || (Date.now() - new Date(order.createdAt).getTime() < 60000 && !["Picked Up", "Out for Delivery", "Completed"].includes(order.status))) && order.status !== "Cancelled" && (
                      <div className="flex flex-col items-end gap-2">
                        {Date.now() - new Date(order.createdAt).getTime() < 60000 && (
                          <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                             <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Risk-Free • {Math.max(0, 60 - Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000))}s</span>
                          </div>
                        )}
                        <button 
                          disabled={cancelling}
                          onClick={() => {
                            setSelectedOrderForCancel(order);
                            setShowCancelModal(true);
                          }}
                          className={`text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all shadow-sm ${
                            Date.now() - new Date(order.createdAt).getTime() < 60000 ? "ring-2 ring-red-100 ring-offset-2 animate-pulse" : ""
                          }`}
                        >
                           Cancel Order
                        </button>
                      </div>
                    )}

                    {order.status === "Cancelled" && order.cancellationReason && (
                      <div className="flex flex-col items-end max-w-[200px]">
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1 italic">Cancelled Due To:</span>
                        <p className="text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-right">{order.cancellationReason}</p>
                      </div>
                    )}

                    {order.status === "Completed" && !order.isReviewed && (
                      <Button 
                        size="sm" 
                        className="rounded-2xl shadow-lg shadow-brand-orange/20"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowReviewModal(true);
                        }}
                      >
                        Rate Experience
                      </Button>
                    )}
                    {order.isReviewed && (
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-4 py-1.5 rounded-2xl border-2 border-green-100">
                        Experience Rated <i className="fa-solid fa-star ml-1"></i>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Hunger List</p>
                    <div className="flex flex-wrap gap-3">
                      {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-50 px-4 py-2 rounded-[1.25rem] text-sm font-bold flex items-center gap-3 shadow-sm">
                           <span className="text-gray-800">{item.menuItem?.name || "Item"}</span>
                           <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                           <span className="text-orange-500">x{item.quantity}</span>
                        </div>
                      )) : <span className="text-gray-400 italic">No details found</span>}
                    </div>
                  </div>

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
                            {order.deliveryAgent.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </Card>
        ))}
      </div>

      {showCancelModal && selectedOrderForCancel && (
        <CancelOrderModal 
          order={selectedOrderForCancel}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrderForCancel(null);
          }}
          onSuccess={handleCancelOrder}
        />
      )}

      {showReviewModal && selectedOrder && (
        <ReviewModal 
          order={selectedOrder}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

export default MyOrders;
