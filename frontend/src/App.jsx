import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import CoursesPage from './pages/CoursesPage';
import BatchesPage from './pages/BatchesPage';
import EnrollmentsPage from './pages/EnrollmentsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import ClassSessionsPage from './pages/ClassSessionsPage';
import AttendancePage from './pages/AttendancePage';
import MaterialsPage from './pages/MaterialsPage';
import GradesPage from './pages/GradesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import Layout from './components/Layout';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'TEACHER') return '/teacher';
    if (user?.role === 'STUDENT') return '/student';
    return '/login';
  };

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={getDefaultRoute()} replace />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
        <Route path="teacher" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="courses" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><CoursesPage /></ProtectedRoute>} />
        <Route path="batches" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><BatchesPage /></ProtectedRoute>} />
        <Route path="enrollments" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><EnrollmentsPage /></ProtectedRoute>} />
        <Route path="assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
        <Route path="submissions" element={<ProtectedRoute allowedRoles={['STUDENT']}><SubmissionsPage /></ProtectedRoute>} />
        <Route path="sessions" element={<ProtectedRoute><ClassSessionsPage /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><AttendancePage /></ProtectedRoute>} />
        <Route path="materials" element={<ProtectedRoute><MaterialsPage /></ProtectedRoute>} />
        <Route path="grades" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><GradesPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><ReportsPage /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route index element={<Navigate to={getDefaultRoute()} replace />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

