import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// --- Layouts and Context ---
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// --- Page Components ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDepartments from './pages/admin/ManageDepartments';

// --- HOD Pages ---
import HodDashboard from './pages/hod/HodDashboard';
import ManageTeachers from './pages/hod/ManageTeachers';
import ApproveTimetables from './pages/hod/ApproveTimetables';

// --- Teacher Pages ---
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageCourseData from './pages/teacher/ManageCourseData';
import GenerateTimetable from './pages/teacher/GenerateTimetable';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* --- Public Routes --- */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />

            {/* --- Admin Protected Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/manage-users" element={<ManageUsers />} />
              <Route path="admin/manage-departments" element={<ManageDepartments />} />
            </Route>

            {/* --- HOD Protected Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
              <Route path="hod" element={<Navigate to="/hod/dashboard" replace />} />
              <Route path="hod/dashboard" element={<HodDashboard />} />
              <Route path="hod/manage-teachers" element={<ManageTeachers />} />
              <Route path="hod/approve-timetables" element={<ApproveTimetables />} />
            </Route>

            {/* --- Teacher Protected Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="teacher" element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/manage-courses" element={<ManageCourseData />} />
              <Route path="teacher/generate-timetable" element={<GenerateTimetable />} />
            </Route>
            
            {/* --- Catch-all 404 Route --- */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;