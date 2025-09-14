import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import global styles
import './App.css';

// Import context provider
import { AuthProvider } from './context/AuthContext';

// --- Import Layouts & Route Guards ---
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute'; // Import the new guard

// --- Import Page Components ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// --- We will create these new page components in the upcoming steps ---
// For now, they are placeholders to make the routes work.
const ManageDepartments = () => <h1>Manage Departments Page</h1>;
const ManageUsers = () => <h1>Manage Users (HODs) Page</h1>;
const ManageTeachers = () => <h1>Manage Teachers Page</h1>;
const ApproveTimetables = () => <h1>Approve Timetables Page</h1>;
const TeacherDashboard = () => <h1>Teacher Dashboard</h1>;
const ManageCourseData = () => <h1>Manage Course Data Page</h1>;
const GenerateTimetable = () => <h1>Generate Timetable Page</h1>;


/**
 * The root component of the application.
 * It now uses the ProtectedRoute component to secure the role-based routes.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* All routes are children of MainLayout for a persistent UI */}
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
               <Route path="hod/dashboard" element={<TeacherDashboard />} /> {/* Can reuse Teacher dashboard for now */}
               <Route path="hod/teachers" element={<ManageTeachers />} />
               <Route path="hod/approvals" element={<ApproveTimetables />} />
            </Route>

            {/* --- Teacher Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['Teacher', 'HOD', 'Admin']} />}>
              <Route path="teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="teacher/manage-data" element={<ManageCourseData />} />
              <Route path="teacher/generate" element={<GenerateTimetable />} />
            </Route>
            
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

