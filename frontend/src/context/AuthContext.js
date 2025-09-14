import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/api';

// 1. Create the context with a default value
export const AuthContext = createContext(null);

/**
 * 2. Create the AuthProvider component.
 * This component will wrap our application and provide the authentication state
 * and functions to all child components.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth state check

  // This effect runs once when the component mounts
  useEffect(() => {
    try {
      // Check if user data and token exist in local storage
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        // If they exist, parse the user data and set the user state
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from local storage", error);
      // Clear storage if data is corrupted
      localStorage.clear();
    }
    setLoading(false); // Finished checking, allow children to render
  }, []);

  /**
   * Handles the user login process.
   * Calls the API, and on success, stores user data and token.
   */
  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      if (response && response.token) {
        // Store user and token in local storage for persistence
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        // Update the user state
        setUser(response.user);
        return response;
      }
    } catch (error) {
      // Let the calling component handle the error display
      console.error("Login failed:", error);
      throw error;
    }
  };

  /**
   * Handles the user logout process.
   * Clears user data from state and local storage.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // The value object contains the state and functions we want to expose
  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user, // A convenient boolean flag
  };

  // 3. Return the Provider with the context value.
  // The `!loading && children` ensures that the rest of the app doesn't
  // render until we've finished our initial check of local storage.
  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};