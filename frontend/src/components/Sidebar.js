import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * The Sidebar component, now with role-based navigation links.
 */
const Sidebar = ({ isOpen, onToggleSidebar }) => {
  // Get the full auth context, including the new role helpers
  const { user, logout, isAuthenticated, isAdmin, isHod, isTeacher } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLinkClick = () => {
    onToggleSidebar();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleLinkClick(); // Also close the sidebar on logout
  };

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
            <NavLink to="/" className="nav-link" end onClick={handleLinkClick}>
              <i className="bi bi-globe me-2"></i>
              Public Timetable
            </NavLink>
          </li>
          <hr />

          {isAuthenticated ? (
            <>
              <li className="nav-item mb-2">
                <span className="nav-link text-muted">
                    Welcome, <strong>{user.username}</strong> ({user.role})
                </span>
              </li>
              
              {/* --- Role-Based Links --- */}

              {/* Admin Links */}
              {isAdmin && (
                <>
                  <h6 className="sidebar-heading px-3 mt-2 mb-1 text-muted text-uppercase">Admin Panel</h6>
                  <li className="nav-item mb-2">
                    <NavLink to="/admin/departments" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-building me-2"></i> Manage Departments
                    </NavLink>
                  </li>
                  <li className="nav-item mb-2">
                    <NavLink to="/admin/users" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-people-fill me-2"></i> Manage Users (HODs)
                    </NavLink>
                  </li>
                </>
              )}

              {/* HOD Links */}
              {isHod && (
                <>
                  <h6 className="sidebar-heading px-3 mt-2 mb-1 text-muted text-uppercase">HOD Panel</h6>
                  <li className="nav-item mb-2">
                    <NavLink to="/hod/dashboard" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-speedometer2 me-2"></i> Dashboard
                    </NavLink>
                  </li>
                   <li className="nav-item mb-2">
                    <NavLink to="/hod/teachers" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-person-plus-fill me-2"></i> Manage Teachers
                    </NavLink>
                  </li>
                  <li className="nav-item mb-2">
                    <NavLink to="/hod/approvals" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-check2-square me-2"></i> Approve Timetables
                    </NavLink>
                  </li>
                </>
              )}

              {/* Teacher Links */}
              {isTeacher && (
                <>
                  <h6 className="sidebar-heading px-3 mt-2 mb-1 text-muted text-uppercase">Teacher Panel</h6>
                   <li className="nav-item mb-2">
                    <NavLink to="/teacher/dashboard" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-speedometer2 me-2"></i> Dashboard
                    </NavLink>
                  </li>
                  <li className="nav-item mb-2">
                    <NavLink to="/teacher/manage-data" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-pencil-square me-2"></i> Manage Course Data
                    </NavLink>
                  </li>
                   <li className="nav-item mb-2">
                    <NavLink to="/teacher/generate" className="nav-link" onClick={handleLinkClick}>
                      <i className="bi bi-calendar2-plus me-2"></i> Generate Timetable
                    </NavLink>
                  </li>
                </>
              )}

              <li className="nav-item mb-2 mt-auto">
                 <button onClick={handleLogout} className="nav-link text-start w-100 btn btn-link">
                    <i className="bi bi-box-arrow-left me-2"></i>
                    Logout
                 </button>
              </li>
            </>
          ) : (
            <li className="nav-item mb-2">
              <NavLink to="/login" className="nav-link" onClick={handleLinkClick}>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
