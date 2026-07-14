import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { eventService } from '../../services/eventService';
import ImageUpload from '../../components/common/ImageUpload';

const categories = ['Music', 'Technology', 'Business', 'Sports', 'Arts', 'Education', 'Food', 'Health', 'Other'];

const emptyTicket = { name: '', price: 0, quantity: 0, description: '' };

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '', description: '', category: 'Technology',
    date: '', time: '', coverImage: '', videoUrl: '', tags: '',
    location: { venue: '', address: '', city: '', state: '', country: 'India', isOnline: false, onlineLink: '' },
  });
  const [ticketTypes, setTicketTypes] = useState([{ ...emptyTicket, name: 'General Admission', price: 0, quantity: 100 }]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Event title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (form.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
    if (!form.date) newErrors.date = 'Event date is required';
    if (!form.time) newErrors.time = 'Event time is required';
    if (!form.location.isOnline) {
      if (!form.location.venue.trim()) newErrors.venue = 'Venue name is required';
      if (!form.location.city.trim()) newErrors.city = 'City is required';
    } else {
      if (!form.location.onlineLink.trim()) newErrors.onlineLink = 'Online meeting link is required';
    }
    if (ticketTypes.length === 0) newErrors.tickets = 'At least one ticket type is required';
    ticketTypes.forEach((t, i) => {
      if (!t.name.trim()) newErrors[`tname_${i}`] = 'Name required';
      if (Number(t.price) < 0) newErrors[`tprice_${i}`] = 'Price cannot be negative';
      if (Number(t.quantity) <= 0) newErrors[`tqty_${i}`] = 'Quantity must be at least 1';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateTicket = (idx, field, value) => setTicketTypes(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  const addTicket = () => setTicketTypes(prev => [...prev, { ...emptyTicket }]);
  const removeTicket = (idx) => setTicketTypes(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        ticketTypes: ticketTypes.map(t => ({ ...t, price: Number(t.price), quantity: Number(t.quantity) })),
        coverImage: form.coverImage || undefined,
      };
      await eventService.createEvent(payload);
      toast.success('Event submitted for admin approval!');
      navigate('/organizer/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const errClass = (key) => errors[key] ? 'border-red-400 focus:ring-red-400' : '';
  const setLoc = (field, value) => setForm(f => ({ ...f, location: { ...f.location, [field]: value } }));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Create New Event</h1>
      <p className="text-slate-500 mb-6 flex items-center gap-1">
        <FiInfo size={14} /> Your event will be reviewed and approved by admin before going live.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg border-b pb-2">Basic Information</h3>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Event Title *</label>
            <input placeholder="e.g. Tech Summit 2026" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={`input-field ${errClass('title')}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description * <span className="text-slate-400 font-normal">(min 20 characters)</span></label>
            <textarea placeholder="Tell attendees what your event is about..." rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`input-field ${errClass('description')}`} />
            <div className="flex justify-between">
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              <span className="text-xs text-slate-400 ml-auto mt-1">{form.description.length} chars</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Tags <span className="text-slate-400 font-normal">(comma separated)</span></label>
              <input placeholder="tech, AI, conference" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" />
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload
            value={form.coverImage}
            onChange={(url) => setForm(f => ({ ...f, coverImage: url }))}
            label="Cover Image *"
          />

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">YouTube Video URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <input placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} className="input-field" />
          </div>
        </div>

        {/* Date & Location */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-lg border-b pb-2">Date, Time & Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Event Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={`input-field ${errClass('date')}`} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Start Time *</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className={`input-field ${errClass('time')}`} />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium">
            <input type="checkbox" checked={form.location.isOnline} onChange={e => setLoc('isOnline', e.target.checked)} className="rounded" />
            This is an online event
          </label>
          {form.location.isOnline ? (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Meeting Link *</label>
              <input placeholder="https://zoom.us/j/..." value={form.location.onlineLink} onChange={e => setLoc('onlineLink', e.target.value)} className={`input-field ${errClass('onlineLink')}`} />
              {errors.onlineLink && <p className="text-red-500 text-xs mt-1">{errors.onlineLink}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Venue Name *</label>
                <input placeholder="e.g. Chennai Trade Centre" value={form.location.venue} onChange={e => setLoc('venue', e.target.value)} className={`input-field ${errClass('venue')}`} />
                {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">City *</label>
                <input placeholder="e.g. Chennai" value={form.location.city} onChange={e => setLoc('city', e.target.value)} className={`input-field ${errClass('city')}`} />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <input placeholder="Full Address" value={form.location.address} onChange={e => setLoc('address', e.target.value)} className="input-field" />
              <input placeholder="State" value={form.location.state} onChange={e => setLoc('state', e.target.value)} className="input-field" />
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
            <div key={idx} className="bg-slate-50 rounded-xl p-4">
              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-5">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Ticket Name *</label>
                  <input placeholder="e.g. General, VIP" value={t.name} onChange={e => updateTicket(idx, 'name', e.target.value)} className={`input-field ${errors[`tname_${idx}`] ? 'border-red-400' : ''}`} />
                  {errors[`tname_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`tname_${idx}`]}</p>}
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Price (₹) *</label>
                  <input type="number" min="0" placeholder="0 = Free" value={t.price} onChange={e => updateTicket(idx, 'price', e.target.value)} className={`input-field ${errors[`tprice_${idx}`] ? 'border-red-400' : ''}`} />
                  {errors[`tprice_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`tprice_${idx}`]}</p>}
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Quantity *</label>
                  <input type="number" min="1" placeholder="e.g. 100" value={t.quantity} onChange={e => updateTicket(idx, 'quantity', e.target.value)} className={`input-field ${errors[`tqty_${idx}`] ? 'border-red-400' : ''}`} />
                  {errors[`tqty_${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`tqty_${idx}`]}</p>}
                </div>
                <button type="button" onClick={() => removeTicket(idx)} disabled={ticketTypes.length === 1} className="col-span-1 text-red-400 disabled:opacity-30 flex justify-center pt-6">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? 'Submitting...' : '🚀 Submit Event for Approval'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
