import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUsers, FiBarChart2, FiEdit, FiTrash2, FiPlusCircle, FiCalendar, FiMapPin } from 'react-icons/fi';
import { eventService } from '../../services/eventService';
import Spinner from '../../components/common/Spinner';

const statusColor = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getMyEvents();
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently? This cannot be undone.')) return;
    try {
      await eventService.deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
        <Link to="/organizer/create-event" className="btn-primary flex items-center gap-2">
          <FiPlusCircle /> Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No events yet</h3>
          <p className="text-slate-500 mb-6">Create your first event and start selling tickets!</p>
          <Link to="/organizer/create-event" className="btn-primary inline-block">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full sm:w-28 h-24 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{event.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={13} />
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMapPin size={13} />
                      {event.location?.isOnline ? 'Online' : event.location?.city}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-primary-700 font-medium">
                      {event.ticketTypes?.reduce((s, t) => s + t.sold, 0)} tickets sold
                    </span>
                    <span className="text-slate-400">
                      / {event.ticketTypes?.reduce((s, t) => s + t.quantity, 0)} total
                    </span>
                  </div>
                  {event.status === 'rejected' && (
                    <p className="text-red-600 text-xs mt-1 font-medium">⚠️ Rejected — Edit and resubmit for approval</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <Link
                    to={`/organizer/events/${event._id}/edit`}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <FiEdit size={14} /> Edit
                  </Link>
                  <Link
                    to={`/organizer/events/${event._id}/attendees`}
                    className="btn-secondary text-sm flex items-center gap-1 px-3 py-2"
                  >
                    <FiUsers size={14} /> Attendees
                  </Link>
                  <Link
                    to={`/organizer/events/${event._id}/analytics`}
                    className="btn-secondary text-sm flex items-center gap-1 px-3 py-2"
                  >
                    <FiBarChart2 size={14} /> Analytics
                  </Link>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete event"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
