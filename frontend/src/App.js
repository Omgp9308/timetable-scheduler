import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import global styles
import './App.css';

// Import context provider
import { AuthProvider } from './context/AuthContext';

// --- Import Layouts ---
import MainLayout from './components/MainLayout'; // The new persistent layout
import AdminLayout from './pages/admin/AdminLayout'; // The security guard for admin routes

// --- Import Page Components ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import Dashboard from './pages/admin/Dashboard';
import GenerateTimetable from './pages/admin/GenerateTimetable';
import ManageData from './pages/admin/ManageData';

/**
 * The root component of the application.
 * It sets up the BrowserRouter and defines all the application routes,
 * now nested within a persistent MainLayout.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* All routes are now children of MainLayout to ensure a persistent UI */}
          <Route path="/" element={<MainLayout />}>
            {/* --- Public Routes --- */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />

            {/* --- Protected Admin Routes --- */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="generate" element={<GenerateTimetable />} />
              <Route path="manage-data" element={<ManageData />} />
            </Route>

            {/* --- Catch-all Route --- */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

