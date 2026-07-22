import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiCalendar, FiLogOut, FiGrid, FiHelpCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-bold text-slate-900">Eventify</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Browse Events</Link>
            {user?.role === 'organizer' && (
              <Link to="/organizer/create-event" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Create Event</Link>
            )}
            <Link to="/support" className="text-slate-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-1">
              <FiHelpCircle size={15} /> Support
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            ) : (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-700">{user.name?.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-medium text-slate-700 truncate">{user.email}</p>
                    </div>
                    <Link to={dashboardLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm">
                      <FiGrid size={14} /> Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm">
                      <FiUser size={14} /> Profile
                    </Link>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm">
                      <FiCalendar size={14} /> My Tickets
                    </Link>
                    <Link to="/support" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm">
                      <FiHelpCircle size={14} /> Support
                    </Link>
                    <div className="border-t border-slate-100 mt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left text-sm">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="md:hidden text-slate-700" onClick={() => setOpen(!open)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link to="/events" onClick={() => setOpen(false)} className="block text-slate-700 font-medium">Browse Events</Link>
          <Link to="/support" onClick={() => setOpen(false)} className="block text-slate-700 font-medium">Support</Link>
          {!user ? (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 text-center">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center">Sign Up</Link>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to={dashboardLink} onClick={() => setOpen(false)} className="block text-slate-700 font-medium">Dashboard</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-slate-700 font-medium">My Tickets</Link>
              <Link to="/profile" onClick={() => setOpen(false)} className="block text-slate-700 font-medium">Profile</Link>
              <button onClick={handleLogout} className="block text-red-600 font-medium">Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
