import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useauth";
export default function ProtectedRoute({ redirectTo = "/login" }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  );
}
