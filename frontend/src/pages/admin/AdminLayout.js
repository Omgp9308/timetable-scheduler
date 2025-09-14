import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

/**
 * AdminLayout is a protected layout component.
 * * 1. It checks if the user is authenticated using AuthContext.
 * 2. If the user is not authenticated, it redirects them to the /login page.
 * 3. If the user is authenticated, it renders the common admin UI shell,
 * which includes the Sidebar and a main content area.
 * 4. The <Outlet /> component is a placeholder from react-router-dom that
 * renders the specific child route (e.g., Dashboard, GenerateTimetable).
 */
const AdminLayout = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // --- Security Check ---
  // If the user is not authenticated, redirect them to the login page.
  // The 'replace' prop prevents the user from navigating back to the admin
  // page after being redirected.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // --- Render Admin UI ---
  // If the user is authenticated, render the dashboard layout.
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar Column */}
        <div className="col-md-3 col-lg-2 p-0">
          <Sidebar />
        </div>

        {/* Main Content Column */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="pt-3 pb-2 mb-3 border-bottom">
            {/* You can add a dynamic page title or breadcrumbs here later */}
          </div>
          
          {/* The Outlet will render the matched child route component */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;