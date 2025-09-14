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
import ManageTeachers from './pages/hod/ManageTeachers';
import ApproveTimetables from './pages/hod/ApproveTimetables'; // Import the real component
import ManageCourseData from './pages/teacher/ManageCourseData';
import GenerateTimetable from './pages/teacher/GenerateTimetable';

// --- Placeholder for Dashboard pages ---
const TeacherDashboard = () => <h1>Dashboard</h1>;


/**
 * The root component of the application.
 * This is the final routing structure for the multi-role system.
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

            {/* --- Admin Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="admin/departments" element={<ManageDepartments />} />
              <Route path="admin/users" element={<ManageUsers />} />
            </Route>

            {/* --- HOD Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['HOD', 'Admin']} />}>
               <Route path="hod/dashboard" element={<TeacherDashboard />} />
               <Route path="hod/teachers" element={<ManageTeachers />} />
               <Route path="hod/approvals" element={<ApproveTimetables />} />
            </Route>

            {/* --- Teacher Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['Teacher', 'HOD', 'Admin']} />}>
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/manage-data" element={<ManageCourseData />} />
              <Route path="teacher/generate" element={<GenerateTimetable />} />
            </-tag>
            
            {/* --- Redirect legacy routes --- */}
            <Route path="/admin" element={<Navigate to="/login" replace />} />

            {/* --- Catch-all Route --- */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

