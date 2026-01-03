"use client";

import { useEffect } from "react";
import { authAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function AuthInitializer() {
  const auth = useAuth();

  // Always call hooks unconditionally; guard inside effect
  const setUser = auth?.setUser;
  const logout = auth?.logout;

  useEffect(() => {
    if (!setUser || !logout) return;

    const loadSession = async () => {
      try {
        // Skip if using mock token
        if (localStorage.getItem('token') === 'mock-token') return;

        const res = await authAPI.me();
        setUser(res.data);
      } catch (err) {
        // If token is invalid, clear auth state
        logout();
      }
    };

    loadSession();
  }, [setUser, logout]);

  return null;
}
