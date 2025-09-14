import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The main header component.
 * It now includes a toggle button to control the sidebar's visibility.
 */
const Header = ({ onToggleSidebar }) => {
  return (
    <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
      <Link className="navbar-brand col-md-3 col-lg-2 me-0 px-3" to="/">
        🎓 Timetable Scheduler
      </Link>
      
      {/* This button will be visible on all screen sizes to toggle the sidebar */}
      <button 
        className="navbar-toggler position-absolute d-md-none collapsed" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#sidebarMenu" 
        aria-controls="sidebarMenu" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
        onClick={onToggleSidebar}
      >
        <span className="navbar-toggler-icon"></span>
      </button>

       {/* A button for desktop view to toggle the sidebar */}
      <div className="d-none d-md-block">
        <button 
            className="btn btn-dark" 
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
        >
            <i className="bi bi-list"></i>
        </button>
      </div>

      <div className="navbar-nav">
        <div className="nav-item text-nowrap">
          {/* This area can be used for other navbar items if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;

