import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    const userWithRole = {
      ...userData,
      role: userData.role || (userData.is_staff ? "admin" : "user")
    };
    setUser(userWithRole);
    localStorage.setItem("user", JSON.stringify(userWithRole));
    localStorage.setItem("access", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      username: user?.username || user?.email,
      login, 
      logout, 
      loading, 
      isAdmin: user?.role === "admin" 
    }}>
      {children}
    </AuthContext.Provider>
  );
};