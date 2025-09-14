import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The main header component.
 * It now includes a single, consistently placed toggle button for the sidebar.
 */
const Header = ({ onToggleSidebar }) => {
  return (
    <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
      <Link className="navbar-brand col-md-3 col-lg-2 me-0 px-3" to="/">
        🎓 Timetable Scheduler
      </Link>

      {/* This wrapper with ms-auto pushes the button to the far right */}
      <div className="ms-auto me-3">
        <button
            className="btn btn-dark"
            onClick={onToggleSidebar}
            title="Toggle Sidebar"
        >
            <i className="bi bi-list fs-4"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;

