import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if the token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.sub,
            role: decoded.role,
            department_id: decoded.dept,
            username: decoded.username || 'User' // Fallback username
          });
        } else {
          // Token is expired, clear it
          logout();
        }
      } catch (error) {
        console.error("Invalid token found in local storage", error);
        logout(); // Clear invalid token
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token); // This will trigger the useEffect
        
        // --- Role-Based Redirect ---
        const decodedUser = jwtDecode(response.token);
        switch (decodedUser.role) {
          case 'Admin':
            navigate('/admin/dashboard');
            break;
          case 'HOD':
            navigate('/hod/dashboard');
            break;
          case 'Teacher':
            navigate('/teacher/dashboard');
            break;
          default:
            navigate('/');
        }
        return response;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user'); // Also remove the old user item if it exists
    localStorage.removeItem('token');
    navigate('/login');
  };

  const contextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};