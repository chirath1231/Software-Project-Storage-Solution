import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on page refresh ONLY (not after close)
  useEffect(() => {
    const savedToken =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    const savedUsername =
      sessionStorage.getItem("username") || localStorage.getItem("username");

    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
    }

    setLoading(false);
  }, []);

  const login = (token, username, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", data.user.id); // save user id (or whatever backend returns)
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("username", username);
    }

    setToken(token);
    setUsername(username);
  };

  const logout = () => {
    sessionStorage.clear();        // clear all session data
    localStorage.clear();
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
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