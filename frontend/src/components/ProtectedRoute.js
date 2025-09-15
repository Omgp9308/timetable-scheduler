import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * A component to protect routes based on user authentication and role.
 * It checks if a user is logged in and if their role is permitted to
 * access the requested route.
 *
 * @param {{ allowedRoles: string[] }} props - The roles permitted to access the route.
 * @returns {React.ReactElement} The child routes (<Outlet />) if authorized,
 * or a redirect component if not.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useContext(AuthContext);

  // 1. Check if the user is authenticated at all.
  if (!isAuthenticated) {
    // If not, redirect them to the login page.
    // The 'replace' prop prevents them from using the back button to return.
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the authenticated user's role is in the list of allowed roles.
  // We need to ensure the roles are compared with the same case.
  const isAuthorized = user && allowedRoles.includes(user.role);

  if (!isAuthorized) {
    // If the user is logged in but not authorized for this specific route,
    // it's best to send them to a generic "Not Found" page to avoid
    // revealing the existence of protected pages.
    console.warn(`Unauthorized access attempt by role '${user.role}' to a route requiring one of [${allowedRoles.join(', ')}]`);
    return <Navigate to="/404" replace />;
  }

  // 3. If the user is both authenticated and authorized, render the child routes.
  return <Outlet />;
};

export default ProtectedRoute;