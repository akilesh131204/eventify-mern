import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiXCircle, FiSend, FiDownload, FiSearch, FiTag, FiClock, FiCheckCircle } from 'react-icons/fi';
import { registrationService } from '../../services';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';

const MyTickets = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferModal, setTransferModal] = useState(null);
  const [transferForm, setTransferForm] = useState({ name: '', email: '' });
  const [transferErrors, setTransferErrors] = useState({});
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, eventsRes] = await Promise.all([
        registrationService.getMyRegistrations(),
        eventService.getEvents({ limit: 4, sort: '-views' }),
      ]);
      setRegistrations(regRes.data);
      setUpcomingEvents(eventsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration? This cannot be undone.')) return;
    try {
      await registrationService.cancel(id);
      toast.success('Registration cancelled successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const validateTransfer = () => {
    const errors = {};
    if (!transferForm.name.trim()) errors.name = 'Recipient name is required';
    if (!transferForm.email.trim()) errors.email = 'Recipient email is required';
    else if (!/^\S+@\S+\.\S+$/.test(transferForm.email)) errors.email = 'Enter valid email';
    setTransferErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!validateTransfer()) return;
    try {
      await registrationService.transfer(transferModal, transferForm);
      toast.success('Ticket transferred successfully!');
      setTransferModal(null);
      setTransferForm({ name: '', email: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchSearch = reg.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
      reg.ticketCode?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'upcoming') return matchSearch && new Date(reg.event?.date) > new Date() && reg.status === 'confirmed';
    if (activeTab === 'past') return matchSearch && new Date(reg.event?.date) < new Date();
    if (activeTab === 'cancelled') return matchSearch && reg.status === 'cancelled';
    return matchSearch;
  });

  const stats = {
    total: registrations.length,
    upcoming: registrations.filter(r => new Date(r.event?.date) > new Date() && r.status === 'confirmed').length,
    attended: registrations.filter(r => r.status === 'checked-in').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
  };

  if (loading) return <Spinner full />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-primary-200">Manage your tickets and discover new events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <FiTag className="text-primary-600 mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total Tickets</p>
        </div>
        <div className="card p-4 text-center">
          <FiClock className="text-amber-600 mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900">{stats.upcoming}</p>
          <p className="text-xs text-slate-500">Upcoming</p>
        </div>
        <div className="card p-4 text-center">
          <FiCheckCircle className="text-green-600 mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900">{stats.attended}</p>
          <p className="text-xs text-slate-500">Attended</p>
        </div>
        <div className="card p-4 text-center">
          <FiXCircle className="text-red-500 mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold text-slate-900">{stats.cancelled}</p>
          <p className="text-xs text-slate-500">Cancelled</p>
        </div>
      </div>

      {/* My Tickets */}
      <div className="card p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-900">My Tickets</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              placeholder="Search tickets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 text-sm py-2 w-64"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎟️</div>
            <p className="text-slate-500 mb-4">No tickets found</p>
            <Link to="/events" className="btn-primary inline-block">Browse Events</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRegistrations.map((reg) => (
              <div key={reg._id} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  <img src={reg.event?.coverImage} alt="" className="w-28 h-full object-cover flex-shrink-0" />
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900 truncate">{reg.event?.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                        reg.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        reg.status === 'checked-in' ? 'bg-green-100 text-green-700' :
                        'bg-primary-100 text-primary-700'}`}>
                        {reg.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1 mb-2">
                      <p className="flex items-center gap-1"><FiCalendar size={11} />{new Date(reg.event?.date).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1"><FiMapPin size={11} />{reg.event?.location?.city || 'Online'}</p>
                    </div>
                    <p className="text-xs font-mono text-primary-600 mb-1">{reg.ticketCode}</p>
                    <p className="text-xs text-slate-600">{reg.ticketTypeName} × {reg.quantity} — <span className="font-semibold">₹{reg.totalAmount}</span></p>

                    {reg.status === 'confirmed' && new Date(reg.event?.date) > new Date() && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleCancel(reg._id)} className="text-xs flex items-center gap-1 text-red-600 hover:underline">
                          <FiXCircle size={11} /> Cancel
                        </button>
                        <button onClick={() => setTransferModal(reg._id)} className="text-xs flex items-center gap-1 text-primary-600 hover:underline">
                          <FiSend size={11} /> Transfer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discover More Events */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Discover More Events</h2>
          <Link to="/events" className="text-primary-600 text-sm font-medium hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingEvents.map(event => (
            <Link key={event._id} to={`/events/${event._id}`} className="card overflow-hidden hover:shadow-md transition-shadow group">
              <img src={event.coverImage} alt={event.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-3">
                <h3 className="font-semibold text-slate-900 text-sm truncate">{event.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{new Date(event.date).toLocaleDateString()} · {event.location?.city}</p>
                <p className="text-primary-600 font-bold text-sm mt-1">{event.minPrice > 0 ? `₹${event.minPrice}+` : 'Free'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-4">Transfer Ticket</h3>
            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Recipient Name *</label>
                <input placeholder="Enter recipient's name" required value={transferForm.name}
                  onChange={e => { setTransferForm(f => ({ ...f, name: e.target.value })); setTransferErrors(er => ({ ...er, name: '' })); }}
                  className={`input-field ${transferErrors.name ? 'border-red-400' : ''}`} />
                {transferErrors.name && <p className="text-red-500 text-xs mt-1">{transferErrors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Recipient Email *</label>
                <input type="email" placeholder="Enter recipient's email" required value={transferForm.email}
                  onChange={e => { setTransferForm(f => ({ ...f, email: e.target.value })); setTransferErrors(er => ({ ...er, email: '' })); }}
                  className={`input-field ${transferErrors.email ? 'border-red-400' : ''}`} />
                {transferErrors.email && <p className="text-red-500 text-xs mt-1">{transferErrors.email}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setTransferModal(null); setTransferErrors({}); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
