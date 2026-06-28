import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard for all authenticated pages.
 * Renders nothing while Firebase Auth state is loading.
 * Redirects to /login if no authenticated user is found.
 * Renders the matched child route via Outlet if authenticated.
 *
 * @returns {JSX.Element|null}
 */
function ProtectedRoute() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
