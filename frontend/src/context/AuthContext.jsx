import { createContext, useContext, useState, useEffect } from "react";

// 1️⃣ Create the context
const AuthContext = createContext();

// 2️⃣ AuthProvider component
export const AuthProvider = ({ children }) => {
  // State to store auth info
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // On app load, check localStorage for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token) {
      setIsAuthenticated(true);
      setUser(username || null);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUser(null);
    // Optional: redirect to login
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3️⃣ Custom hook for easier usage
export const useAuth = () => useContext(AuthContext);
