<<<<<<< HEAD
import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const DEFAULT_USER = {
  name: "Jane Doe",
  email: "janedoe@example.com",
  phone: "+123 567 89000",
  dob: "11 December 1997",
  avatar: "https://i.pravatar.cc/240?img=47",
  plan: "Plus",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = signed out

  const signIn = (partial = {}) => setUser({ ...DEFAULT_USER, ...partial });
  const signOut = () => setUser(null);
  const updateUser = (patch) => setUser((u) => ({ ...(u || DEFAULT_USER), ...patch }));

  const value = useMemo(
    () => ({ user, isAuthed: !!user, signIn, signOut, updateUser }),
    [user]
=======
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiLogin, apiRegister } from "../api/auth";

const AuthContext = createContext(null);

const DEFAULT_PROFILE = {
  phone: "",
  dob: "",
  avatar: "https://i.pravatar.cc/240?img=47",
  plan: "Free",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("@ceynoa_user");
        if (saved) setUser(JSON.parse(saved));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistUser = async (u) => {
    setUser(u);
    await AsyncStorage.setItem("@ceynoa_user", JSON.stringify(u));
  };

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    await persistUser({
      ...DEFAULT_PROFILE,
      id: data.user_id,
      username: data.username,
      name: data.username,
      email: data.email,
      accessToken: data.access,
      refreshToken: data.refresh,
    });
  };

  const register = async (username, email, password, password2) => {
    const data = await apiRegister(username, email, password, password2);
    await persistUser({
      ...DEFAULT_PROFILE,
      id: data.user.id,
      username: data.user.username,
      name: data.user.username,
      email: data.user.email,
      accessToken: data.access,
      refreshToken: data.refresh,
    });
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem("@ceynoa_user");
  };

  const updateUser = (patch) =>
    setUser((u) => {
      const updated = { ...(u || {}), ...patch };
      AsyncStorage.setItem("@ceynoa_user", JSON.stringify(updated));
      return updated;
    });

  const value = useMemo(
    () => ({ user, isAuthed: !!user, isLoading, login, register, signOut, updateUser }),
    [user, isLoading]
>>>>>>> main
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
