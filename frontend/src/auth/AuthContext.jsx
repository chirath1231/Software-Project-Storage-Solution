import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on page refresh ONLY (not after close)
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    const savedUsername = sessionStorage.getItem("username");
    const savedEmail = sessionStorage.getItem("email");
    if (savedToken) {
      setToken(savedToken);
      setUsername(savedUsername);
      setEmail(savedEmail);
    }

    setLoading(false);
  }, []);

  const login = (token, username, email) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("email", email);
    setToken(token);
    setUsername(username);
    setEmail(email);
  };

  const logout = () => {
    sessionStorage.clear();
    setToken(null);
    setUsername(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        email,
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
