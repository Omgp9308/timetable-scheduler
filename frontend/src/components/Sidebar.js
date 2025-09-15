import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * The Sidebar component provides role-based navigation for the entire application.
 * It dynamically renders different sets of links based on the logged-in user's role.
 */
const Sidebar = ({ isOpen, onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLinkClick = () => {
    // This function is now unconditional, so it closes the sidebar on any screen size.
    onToggleSidebar();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavLinks = () => {
    // If no user is logged in, show public and login links
    if (!user) {
      return (
        <>
          <li className="nav-item mb-2">
            <NavLink to="/" className="nav-link" end onClick={handleLinkClick}>
              <i className="bi bi-globe me-2"></i>
              Public Timetable
            </NavLink>
          </li>
          <hr />
          <li className="nav-item mb-2">
            <NavLink to="/login" className="nav-link" onClick={handleLinkClick}>
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </NavLink>
          </li>
        </>
      );
    }

    // Render links based on the user's role
    switch (user.role) {
      case 'Admin':
        return (
          <>
            <h6 className="sidebar-heading px-3 mt-2 mb-1 text-muted text-uppercase">Admin Panel</h6>
            <li className="nav-item mb-2"><NavLink to="/admin/dashboard" className="nav-link" onClick={handleLinkClick}><i className="bi bi-speedometer2 me-2"></i>Dashboard</NavLink></li>
            <li className="nav-item mb-2"><NavLink to="/admin/manage-users" className="nav-link" onClick={handleLinkClick}><i className="bi bi-people me-2"></i>Manage Users</NavLink></li>
            <li className="nav-item mb-2"><NavLink to="/admin/manage-departments" className="nav-link" onClick={handleLinkClick}><i className="bi bi-building me-2"></i>Departments</NavLink></li>
          </>
        );
      case 'HOD':
        return (
          <>
            <h6 className="sidebar-heading px-3 mt-2 mb-1 text-muted text-uppercase">HOD Panel</h6>
            <li className="nav-item mb-2"><NavLink to="/hod/dashboard" className="nav-link" onClick={handleLinkClick}><i className="bi bi-speedometer2 me-2"></i>Dashboard</NavLink></li>
            <li className="nav-item mb-2"><NavLink to="/hod/manage-teachers" className="nav-link" onClick={handleLinkClick}><i className="bi bi-person-video3 me-2"></i>Manage Teachers</NavLink></li>
            <li className="nav-item mb-2"><NavLink to="/hod/approve-timetables" className="nav-link" onClick={handleLinkClick}><i className="bi bi-check2-square me-2"></i>Approve Timetables</NavLink></li>
          </>
        );
      case 'Teacher':
        return (
          <>
            <h6 className="sidebar-heading px-3 mt-2 mb-1 text-muted text-uppercase">Teacher Panel</h6>
            <li className="nav-item mb-2"><NavLink to="/teacher/dashboard" className="nav-link" onClick={handleLinkClick}><i className="bi bi-speedometer2 me-2"></i>Dashboard</NavLink></li>
            <li className="nav-item mb-2"><NavLink to="/teacher/manage-courses" className="nav-link" onClick={handleLinkClick}><i className="bi bi-book me-2"></i>My Courses</NavLink></li>
            <li className="nav-item mb-2"><NavLink to="/teacher/generate-timetable" className="nav-link" onClick={handleLinkClick}><i className="bi bi-calendar2-plus me-2"></i>Generate Timetable</NavLink></li>
          </>
        );
      default:
        return null;
    }
  };

  const sidebarClass = `sidebar bg-light ${isOpen ? 'open' : 'closed'}`;

  return (
    <nav id="sidebarMenu" className={sidebarClass}>
      <div className="position-sticky pt-3">
        <ul className="nav flex-column h-100">
          {renderNavLinks()}
          
          {/* Logout button appears at the bottom if a user is logged in */}
          {user && (
            <li className="nav-item mb-2 mt-auto">
              <button onClick={handleLogout} className="nav-link text-start w-100 btn btn-link">
                <i className="bi bi-box-arrow-left me-2"></i>
                Logout ({user.username})
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;