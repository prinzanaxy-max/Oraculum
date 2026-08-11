import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminLayout } from './layouts/AdminLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminGuard, StudentGuard } from './components/AuthGuard';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { StudentLogin } from './pages/StudentLogin';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';

// Admin Pages
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Members } from './pages/Members';
import { Borrow } from './pages/Borrow';
import { Reservations } from './pages/Reservations';
import { Fines } from './pages/Fines';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentBooks } from './pages/StudentBooks';
import { StudentReader } from './pages/StudentReader';
import { StudentBorrowed } from './pages/StudentBorrowed';
import { StudentReservations } from './pages/StudentReservations';

import { useThemeStore } from './store/themeStore';

const queryClient = new QueryClient();

function App() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Librarian / Admin Protected Routes */}
          <Route
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="books" element={<Books />} />
            <Route path="books/add" element={<Navigate to="/books" replace />} />
            <Route path="checkout" element={<Borrow />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="fines" element={<Fines />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <StudentGuard>
                <StudentLayout />
              </StudentGuard>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="books" element={<StudentBooks />} />
            <Route path="reader/:bookId" element={<StudentReader />} />
            <Route path="borrowed" element={<StudentBorrowed />} />
            <Route path="reservations" element={<StudentReservations />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
