import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiXCircle, FiSend } from 'react-icons/fi';
import { registrationService } from '../../services';
import Spinner from '../../components/common/Spinner';

const MyTickets = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferModal, setTransferModal] = useState(null);
  const [transferForm, setTransferForm] = useState({ name: '', email: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await registrationService.getMyRegistrations();
      setRegistrations(res.data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration? This cannot be undone.')) return;
    try {
      await registrationService.cancel(id);
      toast.success('Registration cancelled');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await registrationService.transfer(transferModal, transferForm);
      toast.success('Ticket transferred');
      setTransferModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Tickets</h1>

      {registrations.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-500 mb-4">You haven't booked any tickets yet.</p>
          <Link to="/events" className="btn-primary inline-block">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {registrations.map((reg) => (
            <div key={reg._id} className="card overflow-hidden">
              <div className="flex">
                <img src={reg.event?.coverImage} alt="" className="w-28 h-full object-cover" />
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-900">{reg.event?.title}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        reg.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : reg.status === 'checked-in'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mt-2 space-y-1">
                    <p className="flex items-center gap-1">
                      <FiCalendar size={12} /> {new Date(reg.event?.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-1">
                      <FiMapPin size={12} /> {reg.event?.location?.city}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-mono">{reg.ticketCode}</p>
                  <p className="text-sm font-medium mt-1">
                    {reg.ticketTypeName} × {reg.quantity} — ₹{reg.totalAmount}
                  </p>

                  {reg.status === 'confirmed' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleCancel(reg._id)}
                        className="text-xs flex items-center gap-1 text-red-600 hover:underline"
                      >
                        <FiXCircle size={12} /> Cancel
                      </button>
                      <button
                        onClick={() => setTransferModal(reg._id)}
                        className="text-xs flex items-center gap-1 text-primary-600 hover:underline"
                      >
                        <FiSend size={12} /> Transfer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {transferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-4">Transfer Ticket</h3>
            <form onSubmit={handleTransfer} className="space-y-3">
              <input
                placeholder="Recipient Name"
                required
                value={transferForm.name}
                onChange={(e) => setTransferForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Recipient Email"
                required
                value={transferForm.email}
                onChange={(e) => setTransferForm((f) => ({ ...f, email: e.target.value }))}
                className="input-field"
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setTransferModal(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
