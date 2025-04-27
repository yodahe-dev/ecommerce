// components/PublicOnlyRoute.jsx
import { Navigate } from 'react-router-dom';

const PublicOnlyRoute = ({ isAuthenticated, children }) => {
  if (isAuthenticated) {
    return <Navigate to="/account" />;
  }
  return children;
};

export default PublicOnlyRoute;