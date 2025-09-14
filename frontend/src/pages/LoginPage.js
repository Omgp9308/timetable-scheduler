import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';

/**
 * The login page for administrators.
 * It provides a form for username and password submission.
 */
const LoginPage = () => {
  // Component state for form inputs, errors, and loading status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks for navigation and accessing the authentication context
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  // --- Redirect if already logged in ---
  // If the user is already authenticated, they should not see the login page.
  // Redirect them to the main admin dashboard.
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // --- Form submission handler ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission which reloads the page
    
    // Basic validation
    if (!username || !password) {
      setError('Both username and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(username, password);
      // On successful login, the AuthContext state will update.
      // We then navigate the user to their dashboard.
      navigate('/admin/dashboard');
    } catch (err) {
      // If login fails, the AuthContext's login function will throw an error.
      // We catch it here and display an appropriate message.
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header text-center bg-dark text-white">
                <h4 className="my-2">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Admin Portal Login
                </h4>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleLogin}>
                  {/* Display error messages here */}
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
    </>
  );
};

export default LoginPage;