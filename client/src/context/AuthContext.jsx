import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token && role) {
      setUser({ token, role });
    }
    setInitialising(false);
  }, []);

  const login = ({ token, role }) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", role);
    setUser({ token, role });
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartRestaurantId");
    setUser(null);
  };

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    login,
    logout,
    initialising,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
