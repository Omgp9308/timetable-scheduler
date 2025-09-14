import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Import the JWT decoding library

// 1. Create the context
export const AuthContext = createContext(null);

/**
 * 2. Create the AuthProvider component.
 * It now manages a more detailed user object and decodes the JWT.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect runs once on app startup
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Decode the token to get user info and check expiration
        const decodedToken = jwtDecode(storedToken);
        
        // Check if the token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({
            id: decodedToken.sub,
            username: decodedToken.user,
            role: decodedToken.role,
            departmentId: decodedToken.dept,
          });
          setToken(storedToken);
        } else {
          // If token is expired, clear storage
          localStorage.clear();
        }
      }
    } catch (error) {
      console.error("Failed to process auth data from local storage", error);
      localStorage.clear();
    }
    setLoading(false);
  }, []);

  /**
   * Handles the user login process.
   */
  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      if (response && response.token) {
        // Store the raw token in local storage
        localStorage.setItem('token', response.token);
        // Set the user state from the response payload
        setUser(response.user);
        setToken(response.token);
        return response;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /**
   * Handles the user logout process.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // The value object contains the state and functions to expose
  const contextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user,
    // Add role-checking helpers for convenience in other components
    isAdmin: user?.role === 'Admin',
    isHod: user?.role === 'HOD',
    isTeacher: user?.role === 'Teacher',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
