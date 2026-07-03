import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiUsers, FiPlusCircle, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { analyticsService } from '../../services';
import { eventService } from '../../services/eventService';
import Spinner from '../../components/common/Spinner';

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${bg}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  </div>
);

const statusColor = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-slate-100 text-slate-700',
};

const OrganizerDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, eventsRes] = await Promise.all([
          analyticsService.getOrganizerOverview(),
          eventService.getMyEvents(),
        ]);
        setOverview(overviewRes.data);
        setEvents(eventsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizer Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your events and track performance</p>
        </div>
        <Link to="/organizer/create-event" className="btn-primary flex items-center gap-2">
          <FiPlusCircle /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon={<FiCalendar className="text-primary-600" size={24} />} label="Total Events" value={overview?.totalEvents || 0} bg="bg-primary-50" />
        <StatCard icon={<FiDollarSign className="text-green-600" size={24} />} label="Total Revenue" value={`₹${(overview?.totalRevenue || 0).toLocaleString()}`} bg="bg-green-50" />
        <StatCard icon={<FiUsers className="text-amber-600" size={24} />} label="Tickets Sold" value={overview?.totalTicketsSold || 0} bg="bg-amber-50" />
      </div>

      {events.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No events yet</h3>
          <p className="text-slate-500 mb-6">Create your first event and start selling tickets!</p>
          <Link to="/organizer/create-event" className="btn-primary inline-block">Create Your First Event</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 text-lg">Recent Events</h2>
              <Link to="/organizer/events" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <img src={event.coverImage} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{event.title}</p>
                    <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize flex-shrink-0 ${statusColor[event.status] || 'bg-slate-100 text-slate-700'}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-lg mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/organizer/create-event" className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                  <FiPlusCircle size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Create New Event</p>
                  <p className="text-xs text-slate-500">Add a new event listing</p>
                </div>
                <FiArrowRight className="text-slate-400 ml-auto group-hover:text-primary-600" />
              </Link>
              <Link to="/organizer/events" className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-slate-600 flex items-center justify-center text-white">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Manage My Events</p>
                  <p className="text-xs text-slate-500">Edit, view attendees, analytics</p>
                </div>
                <FiArrowRight className="text-slate-400 ml-auto group-hover:text-slate-600" />
              </Link>
              <Link to="/events" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center text-white">
                  <FiTrendingUp size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Browse All Events</p>
                  <p className="text-xs text-slate-500">See what others are organizing</p>
                </div>
                <FiArrowRight className="text-slate-400 ml-auto group-hover:text-green-600" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
