import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * The main header component for the application.
 * It displays the brand logo and dynamically shows Login or Logout buttons
 * based on the user's authentication state.
 */
const Header = () => {
  // Access the authentication state and functions from the AuthContext
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handler for the logout action
  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate('/'); // Redirect to the homepage
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          {/* Brand logo/name that links back to the homepage */}
          <Link className="navbar-brand fw-bold" to="/">
            🎓 Timetable Scheduler
          </Link>

          {/* This div uses 'ms-auto' to push its content to the far right */}
          <div className="ms-auto">
            {user ? (
              // If a user is logged in, show a welcome message and a Logout button
              <div className="d-flex align-items-center">
                <span className="navbar-text me-3">
                  Welcome, <strong>{user.username}</strong>
                </span>
                <button
                  className="btn btn-outline-warning"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              // If no user is logged in, show the Admin Login button
              <Link to="/login" className="btn btn-outline-success">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
