import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEYS = {
  user: "user",
  access: "access",
  refresh: "refresh"
};

const parseJSON = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  const token =
    localStorage.getItem(STORAGE_KEYS.access) ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem(STORAGE_KEYS.access) ||
    sessionStorage.getItem("accessToken");

  if (token === "undefined" || token === "null") {
    return null;
  }

  return token;
};

const getStoredRefresh = () => {
  const refresh =
    localStorage.getItem(STORAGE_KEYS.refresh) ||
    sessionStorage.getItem(STORAGE_KEYS.refresh);

  if (refresh === "undefined" || refresh === "null") {
    return null;
  }

  return refresh;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = parseJSON(localStorage.getItem(STORAGE_KEYS.user)) ||
      parseJSON(sessionStorage.getItem(STORAGE_KEYS.user));
    const storedAccess = getStoredToken();
    const storedRefresh = getStoredRefresh();

    if (storedUser && storedAccess) {
      setUser(storedUser);
      setAccessToken(storedAccess);
      if (storedRefresh) {
        setRefreshToken(storedRefresh);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.access);
      localStorage.removeItem(STORAGE_KEYS.refresh);
      sessionStorage.removeItem(STORAGE_KEYS.user);
      sessionStorage.removeItem(STORAGE_KEYS.access);
      sessionStorage.removeItem(STORAGE_KEYS.refresh);
    }

    setLoading(false);
  }, []);

  const persistAuth = (authUser, token, refresh, remember) => {
    const storage = remember ? localStorage : sessionStorage;

    storage.setItem(STORAGE_KEYS.user, JSON.stringify(authUser));
    storage.setItem(STORAGE_KEYS.access, token);
    if (refresh) {
      storage.setItem(STORAGE_KEYS.refresh, refresh);
    } else {
      storage.removeItem(STORAGE_KEYS.refresh);
    }

    if (remember) {
      sessionStorage.removeItem(STORAGE_KEYS.user);
      sessionStorage.removeItem(STORAGE_KEYS.access);
      sessionStorage.removeItem(STORAGE_KEYS.refresh);
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.access);
      localStorage.removeItem(STORAGE_KEYS.refresh);
    }
  };

  const login = useCallback((token, userData, remember = true, refresh = null) => {
    if (!token || !userData) return;

    const authUser = {
      ...userData,
      role: userData.role || (userData.is_staff ? "admin" : "user")
    };

    setUser(authUser);
    setAccessToken(token);
    setRefreshToken(refresh);
    persistAuth(authUser, token, refresh, remember);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.access);
    localStorage.removeItem(STORAGE_KEYS.refresh);
    sessionStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.access);
    sessionStorage.removeItem(STORAGE_KEYS.refresh);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const nextUser = { ...prevUser, ...updates };
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const isAuthenticated = Boolean(user && accessToken);
  const username = user?.username || user?.email || "";
  const email = user?.email || "";
  const userId = user?.id || user?.user_id || null;
  const isAdmin = Boolean(user?.role === "admin" || user?.is_staff);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        userId,
        username,
        email,
        isAdmin,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};