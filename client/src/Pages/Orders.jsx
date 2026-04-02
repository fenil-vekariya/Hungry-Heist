import { useEffect, useState } from "react";
import API from "../services/api";
import Card from "../components/Card";
import { formatPrice, formatDate } from "../utils/formatters";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/order/my");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="pt-24 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">My Orders</h1>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {orders.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">You haven't placed any orders yet.</p>
          </div>
        )}

        {orders.map((order) => (
          <Card 
            key={order._id} 
            className="p-5 md:p-6 hover:scale-[1.01] transition-all duration-300"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Section: Restaurant Name & Date */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-600 mb-1">{order.restaurant?.name || "Restaurant"}</h3>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>

                {/* Middle Section: Status & Payment */}
                <div className="flex flex-wrap items-center gap-3 md:gap-8 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      order.status === 'Completed' 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                    <span className="font-medium">{order.paymentMethod}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Right Section: Total Price */}
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>

              {/* Bottom Section: Items ordered */}
              <div className="pt-4 border-t border-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items Ordered</p>
                <div className="flex flex-wrap gap-2">
                  {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                    <span key={idx} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm font-medium border border-orange-100">
                      {item.menuItem?.name || "Item"} <span className="ml-1 text-orange-400 font-bold">x{item.quantity}</span>
                    </span>
                  )) : <span className="text-gray-400 italic">No items found</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;
