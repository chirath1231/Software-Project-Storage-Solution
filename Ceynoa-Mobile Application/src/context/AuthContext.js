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
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
