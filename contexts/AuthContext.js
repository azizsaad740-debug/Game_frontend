"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user on initial load
  const loadUser = async () => {
    try {
      // Check for mock user in localStorage (for testing purposes)
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && token.startsWith('mock') && savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }

      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
