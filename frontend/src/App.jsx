import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingHistory from './pages/BookingHistory';
import BookingDetail from './pages/BookingDetail';
import Profile from './pages/Profile';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminEvents from './pages/AdminEvents';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#13131A', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)' },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/events"      element={<Events />} />
            <Route path="/events/:id"  element={<EventDetail />} />

            {/* Authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/events/:id/seats"       element={<SeatSelection />} />
              <Route path="/booking/confirmation"   element={<BookingConfirmation />} />
              <Route path="/bookings"               element={<BookingHistory />} />
              <Route path="/bookings/:id"           element={<BookingDetail />} />
              <Route path="/profile"                element={<Profile />} />
            </Route>

            {/* Organizer + Admin */}
            <Route element={<ProtectedRoute roles={['organizer','admin']} />}>
              <Route path="/organizer"              element={<OrganizerDashboard />} />
              <Route path="/organizer/events/create" element={<CreateEvent />} />
              <Route path="/organizer/events/:id/edit" element={<CreateEvent editMode />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin"         element={<AdminDashboard />} />
              <Route path="/admin/users"   element={<AdminUsers />} />
              <Route path="/admin/events"  element={<AdminEvents />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
