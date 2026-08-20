import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on page refresh ONLY
  useEffect(() => {
    const savedToken =
      sessionStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access");

    const savedUsername =
      sessionStorage.getItem("username") ||
      localStorage.getItem("username") ||
      sessionStorage.getItem("username");

    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername || "User");
    } else {
      setToken(null);
      setUsername(null);
    }

    setLoading(false);
  }, []);

  const login = (newToken, newUsername) => {
    if (newToken) {
      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("access_token", newToken);
      localStorage.setItem("access_token", newToken);
    }
    if (newUsername) {
      sessionStorage.setItem("username", newUsername);
      localStorage.setItem("username", newUsername);
    }
    setToken(newToken);
    setUsername(newUsername);
  };

  const logout = () => {
    sessionStorage.clear();
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
