import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';
import { adminService } from '../../services';
import Spinner from '../../components/common/Spinner';

const tabs = ['pending', 'approved', 'rejected', 'all'];

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const fetchEvents = async (status) => {
    setLoading(true);
    try {
      const res = await adminService.getEvents(status === 'all' ? undefined : status);
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(tab);
  }, [tab]);

  const handleApprove = async (id) => {
    try {
      await adminService.approveEvent(id);
      toast.success('Event approved');
      fetchEvents(tab);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectEvent(id);
      toast.success('Event rejected');
      fetchEvents(tab);
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Events</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner full />
      ) : events.length === 0 ? (
        <p className="text-slate-500 py-10 text-center">No events found.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <img src={event.coverImage} className="w-full sm:w-24 h-24 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{event.title}</h3>
                <p className="text-sm text-slate-500">
                  By {event.organizer?.organizationName || event.organizer?.name} ({event.organizer?.email})
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(event.date).toLocaleDateString()} · {event.location?.city || 'Online'}
                </p>
              </div>
              {event.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(event._id)} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg">
                    <FiCheck />
                  </button>
                  <button onClick={() => handleReject(event._id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">
                    <FiX />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
