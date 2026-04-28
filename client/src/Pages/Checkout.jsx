import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import { formatPrice } from "../utils/formatters";

function Checkout() {
    const { items, restaurantId, total, increment, decrement, removeItem, clear, itemCount } = useCart();
    const navigate = useNavigate();
    const [userAddress, setUserAddress] = useState(null);
    const [outstandingBalance, setOutstandingBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Inline Address Form State
    const [newAddress, setNewAddress] = useState({
        flat: "", building: "", area: "", town: "", city: "", state: "", pin: ""
    });
    const [savingAddress, setSavingAddress] = useState(false);

    let deliveryCharge = 25;
    if (total >= 300) deliveryCharge = 0;
    else if (total >= 150) deliveryCharge = 15;
    const tax = Math.round(total * 0.05);
    const handlingFee = 5;
    const grandTotal = total + tax + deliveryCharge + handlingFee + outstandingBalance;

    useEffect(() => {
        if (itemCount === 0) {
            navigate("/cart");
            return;
        }
        
        const fetchAddress = async () => {
            try {
                const res = await API.get("/auth/profile");
                if (res.data.address && res.data.address.city && res.data.address.pin) {
                    setUserAddress(res.data.address);
                } else {
                    setUserAddress(null);
                }
                setOutstandingBalance(res.data.outstandingBalance || 0);
            } catch (err) {
                console.log(err);
                setUserAddress(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAddress();
    }, [itemCount, navigate]);

    const handleSaveAddress = async () => {
        if (!newAddress.flat || !newAddress.area || !newAddress.city || !newAddress.pin) {
            alert("Please fill in Flat, Area, City, and Pincode.");
            return;
        }
        setSavingAddress(true);
        try {
            const res = await API.put("/auth/address", newAddress);
            setUserAddress(res.data.address);
        } catch (err) {
            console.error("Failed to save address", err);
            alert("Failed to save address. Please try again.");
        } finally {
            setSavingAddress(false);
        }
    };


    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!userAddress) {
            alert("Please add an address before placing an order.");
            return;
        }
        
        try {
            const orderRes = await API.post("/order/place", {
                restaurant: restaurantId,
                items: items.map((i) => ({
                    menuItem: i.menuItem,
                    quantity: i.quantity,
                })),
                paymentMethod: paymentMethod,
                deliveryAddress: [userAddress.flat, userAddress.building, userAddress.area, userAddress.town, userAddress.city]
                    .filter(part => part && part.trim() !== "")
                    .join(", ")
            });

            const systemOrderId = orderRes.data.order._id;

            if (paymentMethod === "Online") {
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    alert("Failed to load Razorpay SDK. Please check your connection.");
                    return;
                }
                // Razorpay Flow
                const paymentRes = await API.post("/payment/create-order", {
                    amount: grandTotal,
                    orderId: systemOrderId
                });

                const { razorpayOrderId, amount, currency } = paymentRes.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use test key from .env
                    amount: amount,
                    currency: currency,
                    name: "Hungry Heist",
                    description: "Food Delivery Order",
                    order_id: razorpayOrderId,
                    handler: async function (response) {
                        try {
                            await API.post("/payment/verify", {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: systemOrderId
                            });
                            alert("Payment Successful!");
                            clear();
                            navigate("/my-orders");
                        } catch (verifyErr) {
                            console.error("Payment Verification Failed", verifyErr);
                            alert("Payment verification failed. Your order is pending.");
                            navigate("/my-orders");
                        }
                    },
                    prefill: {
                        name: "Customer",
                    },
                    theme: {
                        color: "#f97316"
                    }
                };
                
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response){
                    console.error(response.error.description);
                    alert("Payment Failed. Your order is pending.");
                    navigate("/my-orders");
                });
                rzp.open();
            } else {
                // COD Flow
                alert("Order Placed Successfully!");
                clear();
                navigate("/my-orders");
            }
        } catch (err) {
            console.log(err);
            alert("Failed to place order.");
        }
    };

    if (loading) return <div className="app-page" style={{ textAlign: "center", padding: "40px" }}>Loading checkout...</div>;

    return (
        <div className="min-h-screen bg-[#fcfcfc] pt-8 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
                    <div>
                        <BackButton className="mb-6 shadow-brand-orange/5" />
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-3">Confirm Your Order</h2>
                        <p className="text-gray-500 font-medium">Verify your details and items before placing the order.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column (2/3) - Address & Payment */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Delivery Address Section */}
                        <Card className="p-8 md:p-10 border-none bg-white shadow-md relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-orange-100 transition-colors"></div>
                           
                           <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-location-dot text-orange-500"></i> Delivery Address
                            </h3>

                            <div className="bg-gray-50 p-6 md:p-8 rounded-[2rem] border border-gray-100 relative group/addr transition-all hover:bg-white hover:border-orange-200">
                                {userAddress ? (
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-500">
                                                    <i className="fa-solid fa-house-chimney"></i>
                                                </div>
                                                <p className="font-extrabold text-gray-900 text-lg leading-tight uppercase tracking-tight">
                                                    {userAddress.flat}, {userAddress.building}
                                                </p>
                                            </div>
                                            <div className="pl-[52px]">
                                                <p className="text-gray-500 font-medium text-sm leading-relaxed mb-1">
                                                    {userAddress.area}, {userAddress.town}
                                                </p>
                                                <p className="text-gray-900 font-black text-xs uppercase tracking-widest">
                                                    {userAddress.city}, {userAddress.state} - {userAddress.pin}
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            className="h-10 text-xs px-6 rounded-xl shrink-0"
                                            onClick={() => navigate("/profile")}
                                        >
                                            Change Address
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-lg">
                                                <i className="fa-solid fa-triangle-exclamation"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 leading-none mb-1">No Delivery Address Found</h4>
                                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">Please add an address to continue</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <input type="text" placeholder="Flat / House No. *" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={newAddress.flat} onChange={(e) => setNewAddress({...newAddress, flat: e.target.value})} />
                                            <input type="text" placeholder="Building / Apartment" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={newAddress.building} onChange={(e) => setNewAddress({...newAddress, building: e.target.value})} />
                                            <input type="text" placeholder="Area / Sector *" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={newAddress.area} onChange={(e) => setNewAddress({...newAddress, area: e.target.value})} />
                                            <input type="text" placeholder="Town / Landmark" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={newAddress.town} onChange={(e) => setNewAddress({...newAddress, town: e.target.value})} />
                                            <input type="text" placeholder="City *" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" placeholder="State" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
                                                <input type="text" placeholder="Pincode *" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={newAddress.pin} onChange={(e) => setNewAddress({...newAddress, pin: e.target.value.replace(/\D/g, '').slice(0,6)})} />
                                            </div>
                                        </div>
                                        
                                        <Button onClick={handleSaveAddress} disabled={savingAddress} className="w-full py-3 shadow-lg shadow-orange-500/20">
                                            {savingAddress ? "Saving..." : "Save Address & Continue"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card className="p-8 md:p-10 border-none bg-white shadow-md">
                            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <i className="fa-solid fa-wallet text-orange-500"></i> Payment Method
                            </h3>
                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "Online" ? "border-orange-500 bg-orange-50" : "border-gray-100 bg-white"}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="Online" 
                                        checked={paymentMethod === "Online"} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500 border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-extrabold text-gray-900 leading-none mb-1">Pay Online (Razorpay)</h4>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">Credit/Debit, UPI, NetBanking</p>
                                    </div>
                                    <i className="fa-brands fa-cc-visa text-2xl text-gray-400"></i>
                                </label>
                                
                                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-orange-500 bg-orange-50" : "border-gray-100 bg-white"}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="COD" 
                                        checked={paymentMethod === "COD"} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-5 h-5 text-orange-500 focus:ring-orange-500 border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-extrabold text-gray-900 leading-none mb-1">Cash on Delivery</h4>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none">Pay at your doorstep</p>
                                    </div>
                                    <i className="fa-solid fa-money-bill-wave text-xl text-gray-400"></i>
                                </label>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column (1/3) - Sticky Summary */}
                    <div className="lg:col-span-5 space-y-8 sticky top-20">
                        <Card className="p-8 md:p-10 border-none bg-white shadow-xl relative overflow-hidden rounded-[2.5rem] group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-orange-100/50 transition-all duration-1000"></div>
                            
                            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative text-gray-900">
                                <i className="fa-solid fa-receipt text-orange-500"></i> Summary
                                <span className="absolute -right-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter shadow-sm">{itemCount} items</span>
                            </h3>
                            
                            <div className="max-h-[300px] overflow-y-auto pr-2 mb-8 custom-scrollbar space-y-4 relative">
                                {items.map(item => (
                                    <div key={item.menuItem} className="flex justify-between items-center group/item p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm leading-tight text-gray-900 mb-1">{item.name}</h4>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{formatPrice(item.price)} per unit</p>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4 bg-gray-100 p-1 rounded-xl shadow-inner text-gray-900">
                                            <button 
                                                onClick={() => decrement(item.menuItem)} 
                                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300 text-xs shadow-sm"
                                            >-</button>
                                            <span className="font-black text-xs w-5 text-center text-orange-500">{item.quantity}</span>
                                            <button 
                                                onClick={() => increment(item.menuItem)} 
                                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300 text-xs shadow-sm"
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/10 space-y-4 mb-10 relative">
                                <div className="flex justify-between items-center text-gray-500 text-xs font-black uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 text-xs font-black uppercase tracking-widest">
                                    <span>Tax (5%)</span>
                                    <span className="text-gray-900">{formatPrice(tax)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 text-xs font-black uppercase tracking-widest">
                                    <span>Handling Fee</span>
                                    <span className="text-gray-900">{formatPrice(handlingFee)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 text-xs font-black uppercase tracking-widest">
                                    <span>Delivery Charges</span>
                                    <span className={deliveryCharge === 0 ? "text-green-500 font-black" : "text-gray-900"}>
                                        {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                                    </span>
                                </div>

                                {outstandingBalance > 0 && (
                                    <div className="flex justify-between items-center text-red-500 text-xs font-black uppercase tracking-widest bg-red-50 p-2 rounded-xl border border-red-100">
                                        <div className="flex items-center gap-2">
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                            <span>Cancellation Fee</span>
                                        </div>
                                        <span>{formatPrice(outstandingBalance)}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                                    <i className="fa-solid fa-circle-info text-orange-500 text-[10px]"></i>
                                    <p className="text-[9px] text-orange-600 font-bold uppercase tracking-widest leading-none">
                                        {outstandingBalance > 0 
                                            ? `Fee from previous late cancellation included.` 
                                            : `Free delivery applies to orders above ${formatPrice(300)}`}
                                    </p>
                                </div>
                                    <div className="flex justify-between items-end pt-4 mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Grand Total</span>
                                            <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{formatPrice(grandTotal)}</span>
                                        </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative">
                                <Button 
                                    fullWidth 
                                    className="py-5 text-xl font-black shadow-xl shadow-orange-500/20 group h-16 shrink-0 active:scale-95" 
                                    onClick={handlePlaceOrder} 
                                    disabled={!userAddress}
                                >
                                    CONFIRM HEIST ({formatPrice(grandTotal)})
                                    <i className="fa-solid fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
                                </Button>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">By continuing, you agree to our Terms of Heist.</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
