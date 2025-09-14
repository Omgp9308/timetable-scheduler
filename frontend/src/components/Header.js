import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The main header component for the application.
 * It now only displays the brand logo. All user-related actions
 * have been moved to the new dynamic Sidebar.
 */
const Header = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          {/* Brand logo/name that links back to the homepage */}
          <Link className="navbar-brand fw-bold" to="/">
            🎓 Timetable Scheduler
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;

