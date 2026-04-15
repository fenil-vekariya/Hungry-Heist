import { useState } from "react";
import Button from "./Button";
import Card from "./Card";
import { formatPrice } from "../utils/formatters";

function CancelOrderModal({ order, onClose, onSuccess, role = "customer" }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const customerReasons = [
    "Forgot to add items",
    "Estimated delivery time is too long",
    "Wrong delivery address selected",
    "Changed my mind / Not hungry anymore",
    "Ordered by mistake",
    "Found a better deal elsewhere",
    "Other (Please specify)"
  ];

  const restaurantReasons = [
    "Item out of stock / Unavailable",
    "Kitchen is currently overloaded",
    "Restaurant is closing / Technical issue",
    "Unexpected operational delay",
    "Customer address is unreachable",
    "Other (Please specify)"
  ];

  const reasons = role === "restaurant" ? restaurantReasons : customerReasons;

  const handleCancel = async () => {
    if (!reason) {
      setError("Please select a reason for cancellation.");
      return;
    }

    const finalReason = reason === "Other (Please specify)" ? `Other: ${customReason}` : reason;

    if (reason === "Other (Please specify)" && !customReason.trim()) {
      setError("Please provide your specific reason in the text box.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onSuccess(order._id, finalReason);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl border-none animate-scale-in flex flex-col max-h-[90vh]">
        <div className="bg-red-500 p-6 text-white relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Cancel Heist?</h3>
            <p className="text-red-100 text-sm font-medium">Please tell us why you're cancelling so we can improve.</p>
          </div>
          <i className="fa-solid fa-ban absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12"></i>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-6">
            {/* Fee Warning Banner */}
            {role === "customer" && order.status !== "Pending" && (Date.now() - new Date(order.createdAt).getTime() > 60000) && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Fee Warning</p>
                  <p className="text-xs font-bold text-amber-900 leading-tight">A 100% cancellation fee of {formatPrice(order.totalAmount)} will be charged as the restaurant has already started preparing your heist.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Select Reason</p>
              <div className="grid grid-cols-1 gap-2">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setReason(r);
                      setError("");
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${reason === r
                        ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                        : "border-gray-50 bg-gray-50 text-gray-600 hover:border-gray-200"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {reason === "Other (Please specify)" && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Specify your reason</label>
                <textarea
                  placeholder="Please describe the issue..."
                  className="w-full bg-gray-50 border-2 border-red-100 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-red-500 rounded-2xl px-5 py-4 outline-none transition-all text-sm font-bold min-h-[100px]"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-sm font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
            >
              Keep Order
            </button>
            <Button
              className="flex-[1.5] py-4 bg-red-500 hover:bg-red-600 shadow-red-500/20 active:scale-95"
              onClick={handleCancel}
              isLoading={loading}
              disabled={loading}
            >
              CANCEL NOW
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CancelOrderModal;
