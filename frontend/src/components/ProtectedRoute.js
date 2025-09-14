import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * A reusable component to protect routes based on user authentication and role.
 *
 * @param {object} props
 * @param {string[]} props.allowedRoles - An array of roles that are allowed to access this route.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  // While the auth context is loading, show a spinner
  if (loading) {
    return <Spinner message="Authenticating..." />;
  }

  // If the user is not authenticated, redirect them to the login page.
  // We also pass the current location so we can redirect them back after login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, check if their role is in the allowedRoles array.
  const isAuthorized = allowedRoles.includes(user.role);

  if (isAuthorized) {
    // If authorized, render the child component (the actual page).
    return <Outlet />;
  } else {
    // If not authorized, redirect to a "not found" page or a dedicated "unauthorized" page.
    // This prevents users from knowing that a protected page exists at that URL.
    return <Navigate to="/not-found" replace />;
  }
};

export default ProtectedRoute;
