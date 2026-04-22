import { createContext, useContext, useState, useEffect } from "react";

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

  if (savedToken) {
    setToken(savedToken);
  }

  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }

  setLoading(false);
}, []);

useEffect(() => {
  console.log("USER:", user);
}, [user]);

  const login = (token, userData, rememberMe = false) => {
    if (!userData) return; 
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));

    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.clear();        // clear all session data
    localStorage.clear();
    setToken(null);
    // setUsername(null);
    setUser(null);
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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);