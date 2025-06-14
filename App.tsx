
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Role } from './types';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import UserDashboardPage from './pages/User/UserDashboardPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import BookCatalogPage from './pages/User/BookCatalogPage';
import MyBooksPage from './pages/User/MyBooksPage';
import AdminBookManagementPage from './pages/Admin/AdminBookManagementPage';
// import NotFoundPage from './pages/NotFoundPage';

// Higher-order component for routes accessible only when not authenticated
const AuthLayout: React.FC = () => {
  const { currentUser } = useAuth();
  if (currentUser) {
    // If user is already logged in, redirect them from auth pages (login/register)
    // to the main dashboard.
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <Outlet />
    </div>
  );
};

// Higher-order component for routes accessible only when authenticated
const ProtectedLayout: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Higher-order component for admin-specific routes
const AdminRoute: React.FC = () => {
  const { currentUser } = useAuth();
  // Ensure user is loaded and is an admin
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    // Redirect non-admins trying to access admin routes to the user dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading Application...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedLayout />}>
        {/* Default route for authenticated users - always go to user dashboard first */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* User Routes */}
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/books" element={<BookCatalogPage />} />
        <Route path="/my-books" element={<MyBooksPage />} />

        {/* Admin Routes - Nested under /admin and protected by AdminRoute */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="books" element={<AdminBookManagementPage />} />
          {/* Optional: if admin also needs a root /admin page, define it here or redirect */}
          {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
        </Route>
        
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
    </Routes>
  );
};

export default App;