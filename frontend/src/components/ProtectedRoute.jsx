import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile } from "../api"; // API returns { ..., role: { id, name } }

function ProtectedRoute({ isAuthenticated, allowedRoles = [], children }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const profile = await getProfile(localStorage.getItem("token"));
        // Use the role name (string), not the role id (UUID)
        setUserRole(profile.role?.name || null);
      } catch {
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.some(
      (role) => role.toLowerCase() === (userRole || "").toLowerCase()
    )
  ) {
    // user role not in allowed roles
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
