import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ScreeningsPage from './pages/ScreeningsPage';
import RoomViewPage from './pages/RoomViewPage';
import MyReservationsPage from './pages/MyReservationsPage';
import AdminScreeningsPage from './pages/AdminScreeningsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 bg-light">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<ScreeningsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes (logged in users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/room/:id" element={<RoomViewPage />} />
              <Route path="/my-reservations" element={<MyReservationsPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/screenings" element={<AdminScreeningsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={
              <div className="container mt-5">
                <div className="alert alert-warning">
                  <h4>Page not found</h4>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
