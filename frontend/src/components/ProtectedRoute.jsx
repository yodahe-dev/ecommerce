import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, userRole, requiredRoles = [], children }) => {
  if (!isAuthenticated) {
    // Not logged in: redirect to login
    return <Navigate to="/login" />;
  }

  // Admin can access everything
  if (userRole === "admin") {
    return children;
  }

  // If no specific role restriction, allow logged-in users
  if (requiredRoles.length === 0) {
    return children;
  }

  // Manager can access admin and manager routes (but not seller-only)
  if (userRole === "manager") {
    // If route requires seller role only, block access
    if (requiredRoles.includes("seller") && !requiredRoles.includes("manager") && !requiredRoles.includes("admin")) {
      return <Navigate to="/" />;
    }
    // Otherwise allow if requiredRoles includes manager or admin
    if (requiredRoles.includes("manager") || requiredRoles.includes("admin")) {
      return children;
    }
    // Block otherwise
    return <Navigate to="/" />;
  }

  // For seller, allow only seller pages
  if (userRole === "seller") {
    if (requiredRoles.includes("seller")) {
      return children;
    }
    return <Navigate to="/" />;
  }

  // For any other role or no role, block access to role-restricted pages
  return <Navigate to="/" />;
};

export default ProtectedRoute;
