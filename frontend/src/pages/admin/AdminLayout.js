import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * AdminLayout is now a purely logical component that acts as a guard.
 * It checks for authentication and either renders the requested admin page 
 * via <Outlet /> or redirects to the login page.
 * The visual layout is now handled by the parent MainLayout component.
 */
const AdminLayout = () => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child admin route (e.g., Dashboard).
  return <Outlet />;
};

export default AdminLayout;

