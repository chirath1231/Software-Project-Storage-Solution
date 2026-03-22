import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on page refresh ONLY (not after close)
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    const savedUsername = sessionStorage.getItem("username");

    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
    }

    setLoading(false);
  }, []);

  const login = (token, username) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    setToken(token);
    setUsername(username);
  };

  const logout = () => {
    sessionStorage.clear();
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
