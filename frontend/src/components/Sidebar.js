import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * The Sidebar component now provides navigation for the entire application.
 * It dynamically changes its content based on whether the user is
 * logged in as an administrator.
 */
const Sidebar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <nav 
      id="sidebarMenu" 
      className="d-md-block bg-light sidebar collapse vh-100"
    >
      <div className="position-sticky pt-3">
        <ul className="nav flex-column nav-pills">
          {/* --- Always Visible Links --- */}
          <li className="nav-item mb-2">
            <NavLink to="/" className="nav-link" end>
              <i className="bi bi-globe me-2"></i>
              Public Timetable
            </NavLink>
          </li>
          
          <hr />

          {/* --- Conditional Links Based on Auth State --- */}
          {isAuthenticated ? (
            // --- Logged-In Admin Links ---
            <>
              <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-2 mb-1 text-muted text-uppercase">
                <span>Admin Panel</span>
              </h6>
              <li className="nav-item mb-2">
                <NavLink to="/admin/dashboard" className="nav-link">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item mb-2">
                <NavLink to="/admin/generate" className="nav-link">
                  <i className="bi bi-calendar2-plus me-2"></i>
                  Generate Timetable
                </NavLink>
              </li>
              <li className="nav-item mb-2">
                <NavLink to="/admin/manage-data" className="nav-link">
                  <i className="bi bi-pencil-square me-2"></i>
                  Manage Data
                </NavLink>
              </li>
              <li className="nav-item mb-2 mt-auto">
                 <button onClick={handleLogout} className="nav-link text-start w-100 btn btn-link">
                    <i className="bi bi-box-arrow-left me-2"></i>
                    Logout
                 </button>
              </li>
            </>
          ) : (
            // --- Logged-Out Link ---
            <>
              <li className="nav-item mb-2">
                <NavLink to="/login" className="nav-link">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Admin Login
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;

