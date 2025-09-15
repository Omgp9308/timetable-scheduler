import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import global styles
import './App.css';

// Import context provider
import { AuthProvider } from './context/AuthContext';

// --- Import Layouts & Route Guards ---
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// --- Import Page Components ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// --- Import Role-Based Page Components ---
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageUsers from './pages/admin/ManageUsers';

import HodDashboard from './pages/hod/HodDashboard';
import ManageTeachers from './pages/hod/ManageTeachers';
import ApproveTimetables from './pages/hod/ApproveTimetables';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageCourseData from './pages/teacher/ManageCourseData';
import GenerateTimetable from './pages/teacher/GenerateTimetable';


/**
 * The root component of the application, defining all navigation routes.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            
            {/* --- Public Routes --- */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />

            {/* --- Admin-Only Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="admin/departments" element={<ManageDepartments />} />
              <Route path="admin/users" element={<ManageUsers />} />
              {/* Redirect /admin to a default admin page */}
              <Route path="admin" element={<Navigate to="/admin/departments" replace />} />
            </Route>

            {/* --- HOD-Only Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
               <Route path="hod/dashboard" element={<HodDashboard />} />
               <Route path="hod/teachers" element={<ManageTeachers />} />
               <Route path="hod/approvals" element={<ApproveTimetables />} />
            </Route>

            {/* --- Teacher-Only Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/manage-data" element={<ManageCourseData />} />
              <Route path="teacher/generate" element={<GenerateTimetable />} />
            </Route>
            
            {/* --- Catch-all 404 Route --- */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
