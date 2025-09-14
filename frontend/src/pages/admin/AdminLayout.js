import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header'; // Import the Header component

/**
 * AdminLayout is a protected layout component.
 * It now includes the main Header.
 */
const AdminLayout = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // --- Security Check ---
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // --- Render Admin UI ---
  return (
    <>
      <Header /> {/* This line ensures the navbar appears on all admin pages */}
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
    </>
  );
};

export default AdminLayout;
