import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { eventService } from '../../services/eventService';
import Spinner from '../../components/common/Spinner';

const categories = ['Music', 'Technology', 'Business', 'Sports', 'Arts', 'Education', 'Food', 'Health', 'Other'];

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Technology',
    date: '', time: '', coverImage: '', videoUrl: '', tags: '',
    location: { venue: '', address: '', city: '', state: '', country: 'India', isOnline: false, onlineLink: '' },
  });
  const [ticketTypes, setTicketTypes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventService.getEventById(id);
        const ev = res.data;
        setForm({
          title: ev.title || '',
          description: ev.description || '',
          category: ev.category || 'Technology',
          date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
          time: ev.time || '',
          coverImage: ev.coverImage || '',
          videoUrl: ev.videoUrl || '',
          tags: ev.tags?.join(', ') || '',
          location: {
            venue: ev.location?.venue || '',
            address: ev.location?.address || '',
            city: ev.location?.city || '',
            state: ev.location?.state || '',
            country: ev.location?.country || 'India',
            isOnline: ev.location?.isOnline || false,
            onlineLink: ev.location?.onlineLink || '',
          },
        });
        setTicketTypes(ev.ticketTypes?.map(t => ({
          _id: t._id, name: t.name, price: t.price, quantity: t.quantity, description: t.description || ''
        })) || []);
      } catch (err) {
        toast.error('Failed to load event');
        navigate('/organizer/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.time) newErrors.time = 'Time is required';
    if (!form.location.isOnline && !form.location.venue.trim()) newErrors.venue = 'Venue is required';
    if (!form.location.isOnline && !form.location.city.trim()) newErrors.city = 'City is required';
    if (ticketTypes.length === 0) newErrors.tickets = 'At least one ticket type is required';
    ticketTypes.forEach((t, i) => {
      if (!t.name) newErrors[`ticket_name_${i}`] = 'Ticket name required';
      if (t.price < 0) newErrors[`ticket_price_${i}`] = 'Invalid price';
      if (t.quantity <= 0) newErrors[`ticket_qty_${i}`] = 'Quantity must be > 0';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateTicket = (idx, field, value) => setTicketTypes(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  const addTicket = () => setTicketTypes(prev => [...prev, { name: '', price: 0, quantity: 0, description: '' }]);
  const removeTicket = (idx) => setTicketTypes(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        ticketTypes: ticketTypes.map(t => ({ ...t, price: Number(t.price), quantity: Number(t.quantity) })),
      };
      await eventService.updateEvent(id, payload);
      toast.success('Event updated successfully!');
      navigate('/organizer/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner full />;

  const errClass = (field) => errors[field] ? 'border-red-400 focus:ring-red-400' : '';

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/organizer/events')} className="text-slate-500 hover:text-slate-700">← Back</button>
        <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg border-b pb-2">Basic Information</h3>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Event Title *</label>
            <input
              placeholder="Event Title"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className={`input-field ${errClass('title')}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
            <textarea
              placeholder="Describe your event..."
              rows={5}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className={`input-field ${errClass('description')}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Tags (comma separated)</label>
              <input placeholder="tech, conference, AI" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Cover Image URL</label>
            <input placeholder="https://..." value={form.coverImage} onChange={(e) => setForm(f => ({ ...f, coverImage: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Video URL (YouTube)</label>
            <input placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm(f => ({ ...f, videoUrl: e.target.value }))} className="input-field" />
          </div>
        </div>

        {/* Date & Location */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg border-b pb-2">Date, Time & Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className={`input-field ${errClass('date')}`} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Time *</label>
              <input type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className={`input-field ${errClass('time')}`} />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.location.isOnline} onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, isOnline: e.target.checked } }))} />
            This is an online event
          </label>
          {form.location.isOnline ? (
            <input placeholder="Online meeting link" value={form.location.onlineLink} onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, onlineLink: e.target.value } }))} className="input-field" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Venue *</label>
                <input placeholder="Venue name" value={form.location.venue} onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, venue: e.target.value } }))} className={`input-field ${errClass('venue')}`} />
                {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">City *</label>
                <input placeholder="City" value={form.location.city} onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, city: e.target.value } }))} className={`input-field ${errClass('city')}`} />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <input placeholder="Address" value={form.location.address} onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, address: e.target.value } }))} className="input-field" />
              <input placeholder="State" value={form.location.state} onChange={(e) => setForm(f => ({ ...f, location: { ...f.location, state: e.target.value } }))} className="input-field" />
            </div>
          )}
        </div>

        {/* Ticket Types */}
        <div className="card p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-semibold text-slate-800 text-lg">Ticket Types</h3>
            <button type="button" onClick={addTicket} className="text-sm text-primary-600 flex items-center gap-1 font-medium">
              <FiPlus /> Add Ticket Type
            </button>
          </div>
          {errors.tickets && <p className="text-red-500 text-xs">{errors.tickets}</p>}
          {ticketTypes.map((t, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <input placeholder="Ticket Name (e.g. VIP)" value={t.name} onChange={(e) => updateTicket(idx, 'name', e.target.value)} className={`input-field ${errors[`ticket_name_${idx}`] ? 'border-red-400' : ''}`} />
                  {errors[`ticket_name_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`ticket_name_${idx}`]}</p>}
                </div>
                <div className="col-span-3">
                  <input type="number" placeholder="Price ₹" value={t.price} onChange={(e) => updateTicket(idx, 'price', e.target.value)} className={`input-field ${errors[`ticket_price_${idx}`] ? 'border-red-400' : ''}`} />
                  {errors[`ticket_price_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`ticket_price_${idx}`]}</p>}
                </div>
                <div className="col-span-3">
                  <input type="number" placeholder="Quantity" value={t.quantity} onChange={(e) => updateTicket(idx, 'quantity', e.target.value)} className={`input-field ${errors[`ticket_qty_${idx}`] ? 'border-red-400' : ''}`} />
                  {errors[`ticket_qty_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`ticket_qty_${idx}`]}</p>}
                </div>
                <button type="button" onClick={() => removeTicket(idx)} disabled={ticketTypes.length === 1} className="col-span-2 text-red-500 disabled:opacity-30 flex justify-center pt-2">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/organizer/events')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
