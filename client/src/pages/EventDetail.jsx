import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { eventService } from '../services/eventService';
import { paymentService } from '../services';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import { loadRazorpayScript } from '../utils/razorpay';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('details');
  const [processing, setProcessing] = useState(false);
  const [attendeeDetails, setAttendeeDetails] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventService.getEventById(id);
        setEvent(res.data);
        if (res.data.ticketTypes?.length) setSelectedTicket(res.data.ticketTypes[0]);
      } catch (err) {
        toast.error('Event not found');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (user) setAttendeeDetails({ name: user.name, email: user.email, phone: user.phone || '' });
  }, [user]);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    if (!attendeeDetails.name || !attendeeDetails.email || !attendeeDetails.phone) {
      toast.error('Please fill all attendee details');
      return;
    }

    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Check your connection.');
        setProcessing(false);
        return;
      }

      const orderRes = await paymentService.createOrder({
        eventId: event._id,
        ticketTypeId: selectedTicket._id,
        quantity,
      });

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'Eventify',
        description: event.title,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: event._id,
              ticketTypeId: selectedTicket._id,
              quantity,
              attendeeDetails,
            });
            toast.success('Ticket booked successfully! Check your email.');
            navigate('/dashboard');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: attendeeDetails.name,
          email: attendeeDetails.email,
          contact: attendeeDetails.phone,
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Spinner full />;
  if (!event) return null;

  const available = selectedTicket ? selectedTicket.quantity - selectedTicket.sold : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-8">
        <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 sm:p-10">
          <div>
            <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {event.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-3">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-6 border-b border-slate-200">
            {['details', 'schedule'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors ${
                  tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'details' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-3">
                  <FiCalendar className="text-primary-600" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="font-medium text-slate-800 text-sm">
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                  <FiClock className="text-primary-600" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Time</p>
                    <p className="font-medium text-slate-800 text-sm">{event.time}</p>
                  </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                  <FiMapPin className="text-primary-600" size={20} />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="font-medium text-slate-800 text-sm">
                      {event.location?.isOnline ? 'Online Event' : event.location?.city}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                {event.videoUrl && (
  <div className="mt-4">
    <h3 className="text-lg font-semibold text-slate-900 mb-2">Event Video</h3>
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe
        src={event.videoUrl.replace('watch?v=', 'embed/')}
        className="w-full h-full"
        allowFullScreen
        title="Event Video"
      />
    </div>
  </div>
)}
              </div>

              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      <FiTag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="card p-4">
                <h3 className="font-semibold text-slate-900 mb-1">Organized by</h3>
                <p className="text-slate-600">{event.organizer?.organizationName || event.organizer?.name}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {event.sessions?.length === 0 && <p className="text-slate-500">Schedule not announced yet.</p>}
              {event.sessions?.map((session) => (
                <div key={session._id} className="card p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-slate-900">{session.title}</h4>
                    <span className="text-xs text-slate-500">
                      {new Date(session.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(session.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {session.speaker && <p className="text-sm text-primary-700 mb-1">Speaker: {session.speaker}</p>}
                  <p className="text-sm text-slate-600">{session.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiUsers /> Select Tickets
            </h3>
            <div className="space-y-3 mb-4">
              {event.ticketTypes?.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                    selectedTicket?._id === t._id ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-900">{t.name}</span>
                    <span className="font-bold text-primary-700">₹{t.price}</span>
                  </div>
                  <p className="text-xs text-slate-500">{t.quantity - t.sold} left</p>
                </button>
              ))}
            </div>

            {selectedTicket && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-700">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-8 w-8 rounded-lg bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="font-medium w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                      className="h-8 w-8 rounded-lg bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <input
                    placeholder="Full Name"
                    value={attendeeDetails.name}
                    onChange={(e) => setAttendeeDetails((a) => ({ ...a, name: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={attendeeDetails.email}
                    onChange={(e) => setAttendeeDetails((a) => ({ ...a, email: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    placeholder="Phone"
                    value={attendeeDetails.phone}
                    onChange={(e) => setAttendeeDetails((a) => ({ ...a, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div className="flex justify-between mb-4 pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Total</span>
                  <span className="font-bold text-xl text-slate-900">₹{selectedTicket.price * quantity}</span>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={processing || available === 0}
                  className="btn-primary w-full"
                >
                  {processing ? 'Processing...' : available === 0 ? 'Sold Out' : 'Book Now'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
