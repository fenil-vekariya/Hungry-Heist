import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import Card from "../components/Card";
import Button from "../components/Button";
import { formatPrice } from "../utils/formatters";

function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  const { addItem } = useCart();
  const { restaurantId } = useParams();

  useEffect(() => {
    fetchMenu();
    fetchCategories();
    if (restaurantId) fetchRestaurantName();
  }, [restaurantId]);

  const fetchRestaurantName = async () => {
    try {
      const res = await API.get(`/restaurant/details/${restaurantId}`);
      if (res.data) setRestaurantName(res.data.name);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError("");
      const url = restaurantId ? `/menu/restaurant/${restaurantId}` : `/menu/all`;
      const res = await API.get(url);
      setMenu(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load menu. Please try again.");
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
    }
  };

  const filteredMenu = selectedCategory === "All"
    ? menu
    : menu.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (name) => {
    const icons = {
      "Pizza": <i className="fa-solid fa-pizza-slice w-5 h-5 flex items-center justify-center"></i>,
      "Burger": <i className="fa-solid fa-burger w-5 h-5 flex items-center justify-center"></i>,
      "Drinks": <i className="fa-solid fa-wine-glass w-5 h-5 flex items-center justify-center"></i>,
      "Dessert": <i className="fa-solid fa-ice-cream w-5 h-5 flex items-center justify-center"></i>,
      "Coffee": <i className="fa-solid fa-coffee w-5 h-5 flex items-center justify-center"></i>
    };
    return icons[name] || <i className="fa-solid fa-utensils w-5 h-5 flex items-center justify-center"></i>;
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            {restaurantName ? restaurantName : 'Discover Something'}
            <span className="text-brand-orange"> Delicious</span>
          </h2>
          <p className="text-gray-500 text-lg">Browse our handcrafted selection of premium dishes.</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === "All"
                ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30 scale-105"
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === cat.name
                  ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30 scale-105"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                }`}
            >
              {getCategoryIcon(cat.name)}
              {cat.name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Cooking up the menu...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-6 rounded-3xl text-center font-bold mb-10">
            {error}
          </div>
        )}

        {/* Food Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.map((item) => (
            <Card key={item._id} className="group border-none bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-2xl">
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover object-center saturate-110 contrast-105 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-gray flex items-center justify-center text-gray-300">
                    <i className="fa-solid fa-utensils text-4xl"></i>
                  </div>
                )}

                {/* Minimal Category Badge */}
                <div className="absolute top-3 left-3">
                  {item.category && (
                    <span className="bg-white/90 backdrop-blur-md text-brand-orange px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                  {item.name}
                </h4>

                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {item.description || "A masterfully crafted dish using only the freshest local ingredients."}
                </p>

                <div className="text-2xl font-black text-brand-orange mb-6">
                  {formatPrice(item.price)}
                </div>

                {/* Actions Section (Pushed to bottom) */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-440 uppercase tracking-widest">Quantity</span>
                    <div className="flex items-center border border-gray-100 rounded-xl bg-gray-50 p-1 h-10">
                      <button
                        className="w-8 h-full flex items-center justify-center hover:text-brand-orange transition-colors"
                        onClick={() => {
                          const input = document.getElementById(`qty-${item._id}`);
                          if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
                        }}
                      >
                        <i className="fa-solid fa-minus text-[10px]"></i>
                      </button>
                      <input
                        type="number"
                        min="1"
                        defaultValue="1"
                        className="w-8 text-center bg-transparent font-black text-brand-dark border-none focus:ring-0 text-sm"
                        id={`qty-${item._id}`}
                        readOnly
                      />
                      <button
                        className="w-8 h-full flex items-center justify-center hover:text-brand-orange transition-colors"
                        onClick={() => {
                          const input = document.getElementById(`qty-${item._id}`);
                          input.value = parseInt(input.value) + 1;
                        }}
                      >
                        <i className="fa-solid fa-plus text-[10px]"></i>
                      </button>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    onClick={() => {
                      const qtyInput = document.getElementById(`qty-${item._id}`);
                      const qty = parseInt(qtyInput.value) || 1;
                      addItem(item, qty);
                      qtyInput.value = 1;
                    }}
                    className="py-3.5 text-sm font-black shadow-lg shadow-brand-orange/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Add to Cart <i className="fa-solid fa-cart-plus ml-2 text-xs"></i>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {menu.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <i className="fa-solid fa-utensils w-20 h-20 text-gray-200 mx-auto mb-6 flex items-center justify-center text-6xl"></i>
            <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No items found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;

