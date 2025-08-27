"use client";

import { create } from "zustand";
import {jwtDecode} from "jwt-decode";

interface JWTPayload {
  exp?: number; // seconds since epoch
  [k: string]: any;
}

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isExpired: () => boolean;
}

function tokenExpired(token: string | null) {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return false; // no expiry => valid
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

const useAuthStore = create<AuthState>((set, get) => {
  // Load token from localStorage
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Immediately clear if expired
  if (tokenExpired(storedToken)) {
    try {
      localStorage.removeItem("token");
    } catch {}
  }

  return {
    token: tokenExpired(storedToken) ? null : storedToken,

    setToken: (token: string) => {
      try {
        localStorage.setItem("token", token);
      } catch {}
      set({ token });

      // Auto-logout when token hits expiry
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp) {
          const msLeft = decoded.exp * 1000 - Date.now();
          if (msLeft > 0) {
            setTimeout(() => {
              if (tokenExpired(get().token)) get().logout();
            }, msLeft);
          } else {
            get().logout();
          }
        }
      } catch {}
    },

    logout: () => {
      try {
        localStorage.removeItem("token");
      } catch {}
      set({ token: null });
    },

    isExpired: () => tokenExpired(get().token),
  };
});

export default useAuthStore;
