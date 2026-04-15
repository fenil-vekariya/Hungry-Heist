import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Card from "../components/Card";
import Button from "../components/Button";
import { formatPrice } from "../utils/formatters";

function Cart() {
    const { items, increment, decrement, removeItem, total, itemCount } = useCart();
    const navigate = useNavigate();

    if (itemCount === 0) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
                <Card className="max-w-[480px] w-full text-center p-12 shadow-2xl shadow-brand-orange/5 border-none">
                    <div className="bg-gray-50 p-6 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 text-gray-300">
                        <i className="fa-solid fa-shopping-bag w-12 h-12 flex items-center justify-center text-4xl"></i>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                        Looks like you haven't added any delicacies yet. Explore our menu and start your order!
                    </p>
                    <Button
                        onClick={() => navigate("/menu")}
                        className="w-full py-4 text-lg"
                    >
                        Browse Menu <i className="fa-solid fa-arrow-right ml-2"></i>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] pt-8 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-brand-orange p-3 rounded-2xl text-white shadow-lg shadow-brand-orange/30">
                        <i className="fa-solid fa-cart-shopping w-6 h-6 flex items-center justify-center text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">Your Cart</h2>
                        <p className="text-gray-500 font-medium">You have {itemCount} items ready for order.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Items List (Left 2/3) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-4 px-8 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>Delicacy Details</span>
                            <span className="hidden md:block">Price Breakdown</span>
                        </div>

                        {items.map((c) => (
                            <Card key={c.menuItem} className="p-5 md:p-6 border-none bg-white shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="bg-orange-50 w-20 h-20 rounded-2xl flex items-center justify-center text-orange-500 font-black text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-inner">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                                                {c.name}
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                                                    {formatPrice(c.price)} / unit
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                        <div className="flex items-center border border-gray-100 rounded-2xl bg-gray-50 p-1 shadow-sm h-11">
                                            <button
                                                onClick={() => c.quantity > 1 && decrement(c.menuItem)}
                                                className={`w-10 h-full flex items-center justify-center transition-colors ${c.quantity > 1 ? 'hover:text-orange-500' : 'text-gray-200 cursor-not-allowed'}`}
                                            >
                                                <i className="fa-solid fa-minus text-xs"></i>
                                            </button>
                                            <span className="w-8 text-center font-black text-gray-900">
                                                {c.quantity}
                                            </span>
                                            <button
                                                onClick={() => increment(c.menuItem)}
                                                className="w-10 h-full flex items-center justify-center hover:text-orange-500 transition-colors"
                                            >
                                                <i className="fa-solid fa-plus text-xs"></i>
                                            </button>
                                        </div>

                                        <div className="text-2xl font-black text-gray-900 min-w-[100px] text-right">
                                            {formatPrice(c.price * c.quantity)}
                                        </div>

                                        <button
                                            onClick={() => removeItem(c.menuItem)}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Remove Item"
                                        >
                                            <i className="fa-solid fa-trash-can text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <button
                            onClick={() => navigate("/menu")}
                            className="flex items-center gap-2 text-orange-500 font-bold text-sm hover:gap-3 transition-all duration-300 mt-4 group"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            <span>Back to Menu</span>
                        </button>
                    </div>


                    <div className="lg:col-span-4 space-y-6 sticky top-20">
                        <Card className="p-8 border-none bg-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                            <h4 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-receipt text-orange-500"></i> Bill Summary
                            </h4>

                            <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
                                <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                                    <span>Total Items</span>
                                    <span className="text-gray-900 font-black">{itemCount}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 font-black">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                                    <span>Delivery Fee</span>
                                    {total >= 199 ? (
                                        <span className="text-green-500 font-black flex items-center gap-1">
                                            <i className="fa-solid fa-bolt text-[10px]"></i> FREE
                                        </span>
                                    ) : (
                                        <span className="text-gray-900 font-black">{formatPrice(30)}</span>
                                    )}
                                </div>
                                {total < 199 && (
                                    <div className="flex items-center gap-2 bg-orange-50/50 px-3 py-2 rounded-xl border border-orange-100/50">
                                        <i className="fa-solid fa-circle-info text-orange-500 text-[10px]"></i>
                                        <p className="text-[9px] text-orange-700 font-bold uppercase tracking-widest leading-none flex-1">
                                            Add {formatPrice(199 - total)} more for FREE delivery
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-10">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
                                    <span className="text-4xl font-black text-gray-900 tracking-tighter">{formatPrice(total + (total >= 199 ? 0 : 30))}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">Taxes & Charges included</p>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    fullWidth
                                    onClick={() => navigate("/checkout")}
                                    className="py-5 text-xl font-black shadow-lg shadow-orange-500/20 group h-16"
                                >
                                    Proceed to Checkout
                                    <i className="fa-solid fa-chevron-right ml-3 text-lg group-hover:translate-x-1 transition-transform"></i>
                                </Button>
                            </div>
                        </Card>


                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl flex items-start gap-4">
                            <div className="bg-white p-3 rounded-2xl text-orange-500 shadow-sm">
                                <i className="fa-solid fa-wallet text-xl"></i>
                            </div>
                            <div>
                                <p className="text-orange-900 font-extrabold text-sm mb-1 leading-none">Payment Mode</p>
                                <p className="text-orange-600/70 text-[10px] font-black uppercase tracking-widest">Cash on Delivery (Available)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;

