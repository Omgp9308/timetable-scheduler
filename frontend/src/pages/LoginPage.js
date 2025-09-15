import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * The login page for all user roles.
 * It now handles role-based redirection after a successful login.
 */
const LoginPage = () => {
  // Component state for form inputs, errors, and loading status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks for navigation and accessing the authentication context
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useContext(AuthContext);

  // --- Role-based redirection logic ---
  const getRedirectPath = (role) => {
    switch (role) {
      case 'Admin':
        return '/admin/departments'; // A default, sensible admin page
      case 'HOD':
        return '/hod/dashboard';
      case 'Teacher':
        return '/teacher/dashboard';
      default:
        return '/'; // Fallback to homepage
    }
  };

  // --- Redirect if already logged in ---
  if (isAuthenticated && user) {
    const path = getRedirectPath(user.role);
    return <Navigate to={path} replace />;
  }

  // --- Form submission handler ---
  const handleLogin = async (e) => {
    e.preventDefault(); 
    
    if (!username || !password) {
      setError('Both username and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // The login function in AuthContext now returns the user object
      const loggedInUser = await login(username, password);
      // Determine the redirect path based on the user's role
      const path = getRedirectPath(loggedInUser.user.role);
      navigate(path);
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header text-center bg-dark text-white">
              <h4 className="my-2">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Portal Login
              </h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleLogin}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="password-input" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
