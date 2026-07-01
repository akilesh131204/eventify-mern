import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiUsers, FiPlusCircle } from 'react-icons/fi';
import { analyticsService } from '../../services';
import { eventService as evService } from '../../services/eventService';
import Spinner from '../../components/common/Spinner';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const OrganizerDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, eventsRes] = await Promise.all([
          analyticsService.getOrganizerOverview(),
          evService.getMyEvents(),
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
        <h1 className="text-2xl font-bold text-slate-900">Organizer Dashboard</h1>
        <Link to="/organizer/create-event" className="btn-primary flex items-center gap-2">
          <FiPlusCircle /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon={<FiCalendar className="text-primary-600" />} label="Total Events" value={overview?.totalEvents || 0} color="bg-primary-50" />
        <StatCard icon={<FiDollarSign className="text-green-600" />} label="Total Revenue" value={`₹${overview?.totalRevenue || 0}`} color="bg-green-50" />
        <StatCard icon={<FiUsers className="text-amber-600" />} label="Tickets Sold" value={overview?.totalTicketsSold || 0} color="bg-amber-50" />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Recent Events</h2>
        {events.length === 0 ? (
          <p className="text-slate-500">No events created yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event._id}
                to={`/organizer/events/${event._id}/attendees`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={event.coverImage} className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium text-slate-800">{event.title}</p>
                    <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    event.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : event.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {event.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
