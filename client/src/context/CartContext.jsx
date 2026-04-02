import { createContext, useContext, useMemo, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });

  const [restaurantId, setRestaurantId] = useState(() => {
    return localStorage.getItem("cartRestaurantId") || null;
  });

  const [showModal, setShowModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items));
    if (restaurantId && items.length > 0) {
      localStorage.setItem("cartRestaurantId", restaurantId);
    } else if (items.length === 0) {
      localStorage.removeItem("cartRestaurantId");
    }
  }, [items, restaurantId]);

  const _proceedToAddItem = (menuItem, itemRestId, quantity = 1) => {
    setRestaurantId(String(itemRestId));
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem === menuItem._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem === menuItem._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: quantity,
        },
      ];
    });
  };

  const addItem = (menuItem, quantity = 1) => {
    const itemRestId = (typeof menuItem.restaurant === 'object' && menuItem.restaurant) 
      ? (menuItem.restaurant._id || menuItem.restaurant) 
      : menuItem.restaurant;
    
    // Only show warning if cart is not empty AND restaurant is different
    if (items.length > 0 && restaurantId && String(restaurantId) !== String(itemRestId)) {
      setPendingItem({ menuItem, itemRestId, quantity });
      setShowModal(true);
      return;
    }

    _proceedToAddItem(menuItem, itemRestId, quantity);
  };

  const increment = (menuItemId) => {
    setItems((prev) =>
      prev.map((i) =>
        i.menuItem === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decrement = (menuItemId) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.menuItem === menuItemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (menuItemId) => {
    setItems((prev) => prev.filter((i) => i.menuItem !== menuItemId));
  };

  const clear = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const handleConfirmClear = () => {
    setItems([]);
    if (pendingItem) {
      _proceedToAddItem(pendingItem.menuItem, pendingItem.itemRestId, pendingItem.quantity);
    }
    setShowModal(false);
    setPendingItem(null);
  };

  const handleCancelModal = () => {
    setShowModal(false);
    setPendingItem(null);
  };

  const value = {
    items,
    restaurantId,
    addItem,
    increment,
    decrement,
    removeItem,
    clear,
    total,
    itemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "400px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#111827", fontSize: "20px" }}>Change Restaurant?</h3>
            <p style={{ margin: "0 0 25px 0", color: "#4b5563", fontSize: "15px", lineHeight: "1.5" }}>
              Your cart contains items from another restaurant. Do you want to clear cart and continue?
            </p>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button 
                onClick={handleCancelModal} 
                style={{ padding: "12px 20px", border: "1px solid #d1d5db", backgroundColor: "white", color: "#374151", borderRadius: "6px", cursor: "pointer", fontWeight: "600", flex: 1, fontSize: "15px" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmClear} 
                style={{ padding: "12px 20px", border: "none", backgroundColor: "#dc2626", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "600", flex: 1, fontSize: "15px" }}
              >
                Yes, Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
