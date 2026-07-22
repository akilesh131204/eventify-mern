import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FiHome, FiCalendar, FiPlusCircle, FiUsers, FiCreditCard, FiCheckSquare } from 'react-icons/fi';

import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Support from './pages/Support';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import MyTickets from './pages/attendee/MyTickets';

import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import MyEvents from './pages/organizer/MyEvents';
import AttendeeList from './pages/organizer/AttendeeList';
import EventAnalytics from './pages/organizer/EventAnalytics';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEvents from './pages/admin/ManageEvents';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePayments from './pages/admin/ManagePayments';

const organizerLinks = [
  { to: '/organizer', label: 'Overview', icon: <FiHome />, end: true },
  { to: '/organizer/create-event', label: 'Create Event', icon: <FiPlusCircle /> },
  { to: '/organizer/events', label: 'My Events', icon: <FiCalendar /> },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: <FiHome />, end: true },
  { to: '/admin/events', label: 'Manage Events', icon: <FiCheckSquare /> },
  { to: '/admin/users', label: 'Manage Users', icon: <FiUsers /> },
  { to: '/admin/payments', label: 'Payments', icon: <FiCreditCard /> },
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* My Tickets - separate from dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute roles={['attendee', 'organizer', 'admin']}><MyTickets /></ProtectedRoute>} />
            <Route path="/my-tickets" element={<ProtectedRoute roles={['attendee', 'organizer', 'admin']}><MyTickets /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Organizer dashboard */}
          <Route path="/organizer" element={<ProtectedRoute roles={['organizer', 'admin']}><DashboardLayout links={organizerLinks} title="Organizer Panel" /></ProtectedRoute>}>
            <Route index element={<OrganizerDashboard />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="events" element={<MyEvents />} />
            <Route path="events/:id/edit" element={<EditEvent />} />
            <Route path="events/:eventId/attendees" element={<AttendeeList />} />
            <Route path="events/:eventId/analytics" element={<EventAnalytics />} />
          </Route>

          {/* Admin dashboard */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout links={adminLinks} title="Admin Panel" /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="payments" element={<ManagePayments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
