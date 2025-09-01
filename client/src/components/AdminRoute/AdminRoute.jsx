import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageLoader from "../PageLoader/PageLoader";
import NotFound from "../../pages/static/NotFound/NotFound";

export default function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.isAdmin === true || user?.isAdmin === "t";

  if (!isAdmin) {
    return <NotFound />;
  }

  return children || <Outlet />;
}
