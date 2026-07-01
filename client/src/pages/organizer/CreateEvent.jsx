import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { eventService } from '../../services/eventService';

const categories = ['Music', 'Technology', 'Business', 'Sports', 'Arts', 'Education', 'Food', 'Health', 'Other'];

const emptyTicket = { name: '', price: 0, quantity: 0, description: '' };

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technology',
    date: '',
    time: '',
    coverImage: '',
    tags: '',
    location: { venue: '', address: '', city: '', state: '', country: 'India', isOnline: false, onlineLink: '' },
  });
  const [ticketTypes, setTicketTypes] = useState([{ ...emptyTicket, name: 'General Admission' }]);

  const updateTicket = (idx, field, value) => {
    setTicketTypes((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const addTicket = () => setTicketTypes((prev) => [...prev, { ...emptyTicket }]);
  const removeTicket = (idx) => setTicketTypes((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ticketTypes.some((t) => !t.name || t.price < 0 || t.quantity <= 0)) {
      toast.error('Please complete all ticket type fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ticketTypes: ticketTypes.map((t) => ({ ...t, price: Number(t.price), quantity: Number(t.quantity) })),
        coverImage: form.coverImage || undefined,
      };
      await eventService.createEvent(payload);
      toast.success('Event submitted for approval!');
      navigate('/organizer/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Basic Information</h3>
          <input
            placeholder="Event Title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="input-field"
          />
          <textarea
            placeholder="Event Description"
            required
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="input-field"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input-field"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="input-field"
            />
          </div>
          <input
            placeholder="Cover Image URL (optional)"
            value={form.coverImage}
            onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
            className="input-field"
          />
          <input
  placeholder="Video URL (YouTube link, optional)"
  value={form.videoUrl || ''}
  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
  className="input-field"
/>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Date, Time & Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="input-field"
            />
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="input-field"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.location.isOnline}
              onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, isOnline: e.target.checked } }))}
            />
            This is an online event
          </label>
          {form.location.isOnline ? (
            <input
              placeholder="Online meeting link"
              value={form.location.onlineLink}
              onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, onlineLink: e.target.value } }))}
              className="input-field"
            />
          ) : (
            <>
              <input
                placeholder="Venue Name"
                required
                value={form.location.venue}
                onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, venue: e.target.value } }))}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="City"
                  required
                  value={form.location.city}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, city: e.target.value } }))}
                  className="input-field"
                />
                <input
                  placeholder="Address"
                  value={form.location.address}
                  onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, address: e.target.value } }))}
                  className="input-field"
                />
              </div>
            </>
          )}
        </div>

        <div className="card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Ticket Types</h3>
            <button type="button" onClick={addTicket} className="text-sm text-primary-600 flex items-center gap-1">
              <FiPlus /> Add Ticket Type
            </button>
          </div>
          {ticketTypes.map((t, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                placeholder="Name (e.g. VIP)"
                value={t.name}
                onChange={(e) => updateTicket(idx, 'name', e.target.value)}
                className="input-field col-span-4"
              />
              <input
                type="number"
                placeholder="Price ₹"
                value={t.price}
                onChange={(e) => updateTicket(idx, 'price', e.target.value)}
                className="input-field col-span-3"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={t.quantity}
                onChange={(e) => updateTicket(idx, 'quantity', e.target.value)}
                className="input-field col-span-3"
              />
              <button
                type="button"
                onClick={() => removeTicket(idx)}
                disabled={ticketTypes.length === 1}
                className="col-span-2 text-red-500 disabled:opacity-30 flex justify-center"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
