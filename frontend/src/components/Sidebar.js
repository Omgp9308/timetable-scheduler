import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * The Sidebar component provides navigation for the admin dashboard.
 * It uses NavLink to highlight the current active route.
 */
const Sidebar = () => {
  return (
    <nav 
      id="sidebarMenu" 
      className="d-md-block bg-light sidebar collapse vh-100"
    >
      <div className="position-sticky pt-3">
        <ul className="nav flex-column nav-pills">
          {/* Admin-specific links */}
          <li className="nav-item mb-2">
            <NavLink to="/admin/dashboard" className="nav-link" end>
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

          {/* Divider and link to public site */}
          <hr />

          <li className="nav-item mb-2">
            <NavLink to="/" className="nav-link">
              <i className="bi bi-globe me-2"></i>
              View Public Site
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
