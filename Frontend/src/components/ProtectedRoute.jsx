// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Simple ProtectedRoute for React Router v6.
 * It checks localStorage for a token (ayu_token). If missing, redirect to /get-in.
 */
export default function ProtectedRoute({ redirectTo = "/get-in" }) {
  const token = localStorage.getItem("ayu_token");
  if (!token) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
