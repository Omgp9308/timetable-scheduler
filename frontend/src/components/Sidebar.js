import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * The Sidebar component provides navigation for the admin dashboard.
 * It uses NavLink to highlight the current active route.
 * * NOTE: This component uses Bootstrap Icons. For the icons to appear,
 * add the following stylesheet link to your `public/index.html` file:
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
 */
const Sidebar = () => {
  return (
    <nav 
      id="sidebarMenu" 
      className="d-md-block bg-light sidebar collapse vh-100"
    >
      <div className="position-sticky pt-3">
        <ul className="nav flex-column nav-pills">
          <li className="nav-item mb-2">
            {/* The 'end' prop ensures this link is only active on the exact path */}
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
        </ul>

        {/* <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Settings</span>
        </h6>
        <ul className="nav flex-column mb-2">
           <li className="nav-item">
            <NavLink to="/admin/profile" className="nav-link">
               <i className="bi bi-person-circle me-2"></i>
               Profile
            </NavLink>
          </li>
           <li className="nav-item">
            <NavLink to="/admin/users" className="nav-link">
               <i className="bi bi-people-fill me-2"></i>
               User Management
            </NavLink>
          </li>
        </ul> */}
      </div>
    </nav>
  );
};

export default Sidebar;