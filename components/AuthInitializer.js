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
        const token = localStorage.getItem('token');
        if (token && token.startsWith('mock')) return;

        const res = await authAPI.me();
        setUser(res.data);
      } catch (err) {
        // If token is invalid, clear auth state
        logout();
      }
    };

    loadSession();

    // Heartbeat: Ping backend every 10 minutes to prevent Render from sleeping
    const pingBackend = async () => {
      try {
        await authAPI.pingHealth();
        console.log('💓 Heartbeat: Backend is awake!');
      } catch (err) {
        console.warn('💓 Heartbeat: Failed to ping backend, it might be sleeping.');
      }
    };

    const heartbeatInterval = setInterval(pingBackend, 1 * 60 * 1000); // 1 minute

    return () => clearInterval(heartbeatInterval);
  }, [setUser, logout]);

  return null;
}
