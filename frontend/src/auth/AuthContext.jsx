import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  
useEffect(() => {
  const savedToken =
    sessionStorage.getItem("token") || localStorage.getItem("token");

  const savedUser =
    sessionStorage.getItem("user") || localStorage.getItem("user");

  if (!savedToken) {
    setLoading(false);
    return;
  }

  setToken(savedToken);

  // First load cached user so UI can render quickly
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }

  // Then fetch the latest profile from backend
  api.get("/api/accounts/profile/")
    .then((res) => {
      const freshUser = res.data;

      setUser(freshUser);

      // Update stored user information as well
      const storage = sessionStorage.getItem("token")
        ? sessionStorage
        : localStorage;

      storage.setItem("user", JSON.stringify(freshUser));
    })
    .catch((err) => {
      console.error("Error fetching current user profile:", err);
    })
    .finally(() => {
      setLoading(false);
    });

}, []);

useEffect(() => {
  console.log("USER:", user);
}, [user]);

  const login = async (token, userData, rememberMe = false) => {
    if (!userData) return;

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));

    setToken(token);
    setUser(userData);

    // Get complete/latest profile information
    try {
      const response = await api.get("/api/accounts/profile/");

      const freshUser = response.data;

      storage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);

    } catch (error) {
      console.error("Could not fetch profile after login:", error);
    }
  };

  const logout = () => {
    sessionStorage.clear();        // clear all session data
    localStorage.clear();
    setToken(null);
    // setUsername(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const storage = localStorage.getItem("token")
      ? localStorage
      : sessionStorage;

    const currentUser = {
      ...user,
      ...updatedUser,
    };

    storage.setItem("user", JSON.stringify(currentUser));
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        username,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);