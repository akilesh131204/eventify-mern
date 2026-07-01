import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUsers, FiBarChart2, FiEdit, FiTrash2 } from 'react-icons/fi';
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;
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
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Events</h1>
      {events.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-500 mb-4">You haven't created any events yet.</p>
          <Link to="/organizer/create-event" className="btn-primary inline-block">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <img src={event.coverImage} className="w-full sm:w-24 h-24 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900">{event.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[event.status]}`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {new Date(event.date).toLocaleDateString()} · {event.location?.city || 'Online'}
                </p>
                <p className="text-sm text-slate-500">
                  {event.ticketTypes?.reduce((s, t) => s + t.sold, 0)} / {event.ticketTypes?.reduce((s, t) => s + t.quantity, 0)} tickets sold
                </p>
              </div>
              <div className="flex gap-2">
                <Link to={`/organizer/events/${event._id}/attendees`} className="btn-secondary text-sm flex items-center gap-1 px-3 py-2">
                  <FiUsers size={14} /> Attendees
                </Link>
                <Link to={`/organizer/events/${event._id}/analytics`} className="btn-secondary text-sm flex items-center gap-1 px-3 py-2">
                  <FiBarChart2 size={14} /> Analytics
                </Link>
                <button onClick={() => handleDelete(event._id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
