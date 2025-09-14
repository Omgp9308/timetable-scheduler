import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * The Sidebar component, now collapsible.
 * It receives `isOpen` and `onToggleSidebar` props to control its state.
 */
const Sidebar = ({ isOpen, onToggleSidebar }) => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // The main class of the sidebar will change based on the isOpen prop
  const sidebarClass = `sidebar bg-light ${isOpen ? 'open' : 'closed'}`;

  return (
    <nav id="sidebarMenu" className={sidebarClass}>
      <div className="position-sticky pt-3">
        <div className="d-flex justify-content-end d-md-none">
             <button onClick={onToggleSidebar} className="btn btn-sm">
                <i className="bi bi-x-lg"></i>
            </button>
        </div>

        <ul className="nav flex-column nav-pills">
          <li className="nav-item mb-2">
            <NavLink to="/" className="nav-link" end>
              <i className="bi bi-globe me-2"></i>
              Public Timetable
            </NavLink>
          </li>
          <hr />
          {isAuthenticated ? (
            <>
              <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-2 mb-1 text-muted text-uppercase">
                <span>Admin Panel</span>
              </h6>
               <li className="nav-item mb-2">
                <span className="nav-link text-muted">
                    Welcome, <strong>{user.username}</strong>
                </span>
              </li>
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
            <li className="nav-item mb-2">
              <NavLink to="/login" className="nav-link">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Admin Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;

