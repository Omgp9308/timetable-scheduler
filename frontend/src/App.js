import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import global styles
import './App.css';

// Import context provider
import { AuthProvider } from './context/AuthContext';

// Import page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Import admin page components and layout
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import GenerateTimetable from './pages/admin/GenerateTimetable';
import ManageData from './pages/admin/ManageData';

/**
 * The root component of the application.
 * It sets up the BrowserRouter and defines all the application routes.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- Protected Admin Routes --- */}
          {/* All routes starting with /admin will first render the AdminLayout.
              The AdminLayout component then decides whether to show its children
              (using the <Outlet />) or redirect to the login page. */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Index route: Redirects /admin to /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="generate" element={<GenerateTimetable />} />
            <Route path="manage-data" element={<ManageData />} />
            {/* Add future admin routes (e.g., profile, users) here */}
            {/* <Route path="profile" element={<ProfilePage />} /> */}
          </Route>

          {/* --- Catch-all Route --- */}
          {/* This route will match any URL that wasn't matched above */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;