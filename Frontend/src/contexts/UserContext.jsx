// src/contexts/UserContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * UserContext (role-aware)
 *
 * - Persists to localStorage under LOCAL_KEY (same as before)
 * - Exposes: user, setUser (raw), saveUser (merge & persist), applyGettingStarted, refreshUser, logout, loading
 *
 * Structure (example):
 * {
 *   id, name, email, initials, avatar,
 *   role: "member" | "doctor" | "admin",
 *   memberProfile: { gender, dob, heightCm, weightKg, activity, dietPlan, healthScore, ... },
 *   doctorProfile: { licenseNo, specialization, clinic, practiceSince, verified: boolean, ... },
 *   adminProfile: { adminCode, permissions: [] }
 * }
 */

const UserContext = createContext(null);

const LOCAL_KEY = "ayu_profile";

const DEMO_USER = {
  id: "local-demo-1",
  name: "Ayu User",
  initials: "AU",
  email: "you@example.com",
  avatar: "",
  role: "member",
  memberProfile: {
    gender: "female",
    dob: "1990-01-01",
    heightCm: 170,
    weightKg: 68,
    activity: "moderate",
    dietPlan: null,
    healthScore: 72,
    location: "Bengaluru, India",
  },
  doctorProfile: null,
  adminProfile: null,
};

export function UserProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore parse errors
      // eslint-disable-next-line no-console
      console.warn("UserContext: failed to parse local user", e);
    }
    return null;
  }, []);

  const refreshUser = useCallback(async (opts = { tryApi: false }) => {
    setLoading(true);
    try {
      // priority: localStorage -> initialUser -> demo
      const local = loadLocal();
      if (local) {
        setUser(local);
        setLoading(false);
        return local;
      }
      if (initialUser) {
        setUser(initialUser);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(initialUser));
        setLoading(false);
        return initialUser;
      }
      setUser(DEMO_USER);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(DEMO_USER));
      setLoading(false);
      return DEMO_USER;
    } catch (err) {
      setUser(DEMO_USER);
      setLoading(false);
      return DEMO_USER;
    }
  }, [initialUser, loadLocal]);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * saveUser(nextUserPartial, opts)
   * - merges partial into current user state
   * - persists to localStorage
   * - if opts.remote === true, will try to PUT to /api/user/profile (placeholder)
   */
  const saveUser = useCallback(async (nextUserPartial = {}, opts = { remote: false }) => {
    const merged = { ...(user || {}), ...(nextUserPartial || {}) };

    // ensure structural fields exist
    if (!merged.memberProfile && merged.role === "member") merged.memberProfile = {};
    if (!merged.doctorProfile && merged.role === "doctor") merged.doctorProfile = merged.doctorProfile || {};
    if (!merged.adminProfile && merged.role === "admin") merged.adminProfile = merged.adminProfile || {};

    setUser(merged);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("UserContext: failed to persist user to localStorage", e);
    }

    if (opts.remote) {
      // placeholder for future remote save
      try {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(merged),
        });
        if (res.ok) {
          const json = await res.json();
          setUser(json);
          try { localStorage.setItem(LOCAL_KEY, JSON.stringify(json)); } catch {}
          return json;
        }
        throw new Error("Remote save failed");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("UserContext: remote save failed", err);
        throw err;
      }
    }

    return merged;
  }, [user]);

  /**
   * applyGettingStarted(payload)
   * - Standardized helper for your GettingStarted flow to set role + profile fields.
   * - payload shape depends on chosen role.
   *
   * Examples:
   *  applyGettingStarted({ role: 'member', name, email, memberProfile: { gender, dob, heightCm, weightKg, activity } })
   *  applyGettingStarted({ role: 'doctor', name, email, doctorProfile: { licenseNo, clinic, specialization, practiceSince } })
   *  applyGettingStarted({ role: 'admin', name, email, adminProfile: { adminCode, permissions } })
   */
  const applyGettingStarted = useCallback(async (payload = {}) => {
    // basic merge & structural normalization
    const next = { ...(user || {}), ...payload };

    // ensure role-specific nested objects exist
    if (next.role === "member") {
      next.memberProfile = { ...(user?.memberProfile || {}), ...(payload.memberProfile || {}) };
      next.doctorProfile = null;
      next.adminProfile = null;
    } else if (next.role === "doctor") {
      next.doctorProfile = { ...(user?.doctorProfile || {}), ...(payload.doctorProfile || {}) };
      // ensure some base member fields might still exist (DOB etc.)
      next.memberProfile = { ...(user?.memberProfile || {}), ...(payload.memberProfile || {}) };
      next.adminProfile = null;
    } else if (next.role === "admin") {
      next.adminProfile = { ...(user?.adminProfile || {}), ...(payload.adminProfile || {}) };
      next.doctorProfile = null;
      next.memberProfile = null;
    }

    // optionally compute initials
    if (!next.initials && next.name) {
      next.initials = next.name.split(" ").map(s => s[0] || "").slice(0,2).join("").toUpperCase();
    }

    // persist locally (no remote by default)
    return saveUser(next, { remote: false });
  }, [user, saveUser]);

  const setRole = useCallback((role) => {
    const next = { ...(user || {}), role };
    // initialize role-specific profile
    if (role === "member") next.memberProfile = next.memberProfile || {};
    if (role === "doctor") next.doctorProfile = next.doctorProfile || {};
    if (role === "admin") next.adminProfile = next.adminProfile || {};
    saveUser(next);
    return next;
  }, [user, saveUser]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch {}
    setUser(null);
  }, []);

  const clearUser = logout;

  const value = {
    user,
    setUser,
    loading,
    refreshUser,
    saveUser,
    applyGettingStarted,
    setRole,
    logout: clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
