import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * The login page for all user roles.
 * It now relies on the AuthContext for redirection after a successful login.
 */
const LoginPage = () => {
  // Component state for form inputs, errors, and loading status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks for navigation and accessing the authentication context
  const { user, login, isAuthenticated } = useContext(AuthContext);

  // --- Redirect if already logged in ---
  // This part is still useful to prevent a logged-in user from seeing the login page
  if (isAuthenticated && user) {
    // We can use a generic redirect to the root, AuthContext will handle the rest
    return <Navigate to="/" replace />;
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
      // The login function in AuthContext now handles navigation.
      await login(username, password);
      // No need to call navigate() here anymore.
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