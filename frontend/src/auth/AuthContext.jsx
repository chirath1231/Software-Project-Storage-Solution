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
    sessionStorage.getItem(STORAGE_KEYS.access) ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem(STORAGE_KEYS.access) ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return token;
};

const getStoredRefresh = () => {
  const refresh =
    sessionStorage.getItem(STORAGE_KEYS.refresh) ||
    sessionStorage.getItem("refresh_token") ||
    localStorage.getItem(STORAGE_KEYS.refresh) ||
    localStorage.getItem("refresh_token");

  if (!refresh || refresh === "undefined" || refresh === "null") {
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
    const storedUser =
      parseJSON(sessionStorage.getItem(STORAGE_KEYS.user)) ||
      parseJSON(localStorage.getItem(STORAGE_KEYS.user)) ||
      parseJSON(sessionStorage.getItem("user")) ||
      parseJSON(localStorage.getItem("user"));

    const storedAccess = getStoredToken();
    const storedRefresh = getStoredRefresh();

    const storedUsername =
      sessionStorage.getItem("username") ||
      localStorage.getItem("username");

    if (storedAccess) {
      const fallbackUser = storedUser || { username: storedUsername || "User", email: storedUsername || "" };
      setUser(fallbackUser);
      setAccessToken(storedAccess);
      if (storedRefresh) {
        setRefreshToken(storedRefresh);
      }
    } else {
      sessionStorage.clear();
      localStorage.clear();
    }

    setLoading(false);
  }, []);

  const persistAuth = (authUser, token, refresh, remember = false) => {
    const mainStorage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    mainStorage.setItem(STORAGE_KEYS.user, JSON.stringify(authUser));
    mainStorage.setItem(STORAGE_KEYS.access, token);
    mainStorage.setItem("access_token", token);
    mainStorage.setItem("token", token);
    if (authUser.username) mainStorage.setItem("username", authUser.username);
    if (authUser.email) mainStorage.setItem("email", authUser.email);

    if (refresh) {
      mainStorage.setItem(STORAGE_KEYS.refresh, refresh);
    } else {
      mainStorage.removeItem(STORAGE_KEYS.refresh);
    }

    otherStorage.removeItem(STORAGE_KEYS.user);
    otherStorage.removeItem(STORAGE_KEYS.access);
    otherStorage.removeItem(STORAGE_KEYS.refresh);
    otherStorage.removeItem("token");
    otherStorage.removeItem("access_token");
  };

  const login = useCallback((token, userData, remember = false, refresh = null) => {
    if (!token) return;

    const authUser = typeof userData === "object" && userData !== null ? {
      ...userData,
      role: userData.role || (userData.is_staff ? "admin" : "user")
    } : {
      username: typeof userData === "string" ? userData : "User",
      email: typeof userData === "string" ? userData : ""
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

    sessionStorage.clear();
    localStorage.clear();
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const nextUser = { ...prevUser, ...updates };
      sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const isAuthenticated = Boolean(user && accessToken);
  const username = user?.username || user?.email || sessionStorage.getItem("username") || localStorage.getItem("username") || "";
  const email = user?.email || sessionStorage.getItem("email") || localStorage.getItem("email") || "";
  const userId = user?.id || user?.user_id || null;
  const isAdmin = Boolean(user?.role === "admin" || user?.role === "superadmin" || user?.is_staff);
  const isSuperUser = Boolean(user?.is_superuser || user?.role === "superadmin");
  const permissions = user?.permissions || [];

  const hasPermission = useCallback((permissionCode) => {
    if (!user) return false;
    if (user.is_superuser || user.role === "superadmin" || user.permissions?.includes("*")) {
      return true;
    }
    if (!permissionCode) return true;
    if (Array.isArray(permissionCode)) {
      return permissionCode.some(p => user.permissions?.includes(p));
    }
    return Boolean(user.permissions && user.permissions.includes(permissionCode));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        token: accessToken,
        refreshToken,
        userId,
        username,
        email,
        isAdmin,
        isSuperUser,
        permissions,
        hasPermission,
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