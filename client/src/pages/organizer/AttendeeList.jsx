import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiSearch } from 'react-icons/fi';
import { registrationService } from '../../services';
import Spinner from '../../components/common/Spinner';

const AttendeeList = () => {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await registrationService.getEventRegistrations(eventId);
        setRegistrations(res.data);
      } catch (err) {
        toast.error('Failed to load attendees');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleExport = async () => {
    try {
      const blob = await registrationService.exportEventRegistrations(eventId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendees.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const filtered = registrations.filter(
    (r) =>
      r.attendeeDetails.name.toLowerCase().includes(search.toLowerCase()) ||
      r.attendeeDetails.email.toLowerCase().includes(search.toLowerCase()) ||
      r.ticketCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner full />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Attendees ({registrations.length})</h1>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search by name, email, ticket code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Ticket</th>
              <th className="text-left p-3 font-medium">Qty</th>
              <th className="text-left p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Code</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="p-3">{r.attendeeDetails.name}</td>
                <td className="p-3">{r.attendeeDetails.email}</td>
                <td className="p-3">{r.ticketTypeName}</td>
                <td className="p-3">{r.quantity}</td>
                <td className="p-3">₹{r.totalAmount}</td>
                <td className="p-3 capitalize">{r.status}</td>
                <td className="p-3 font-mono text-xs">{r.ticketCode}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No attendees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendeeList;
