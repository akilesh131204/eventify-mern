import { useState } from 'react';
import { FiMail, FiMessageSquare, FiUser, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Support = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter valid email';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    else if (form.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/support', form);
      setSubmitted(true);
      toast.success('Support request submitted! We will get back to you within 24 hours.');
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
          <p className="text-slate-500 mb-6">Thank you for contacting us. We will respond to your inquiry within 24 hours at <strong>{form.email}</strong></p>
          <button onClick={() => { setSubmitted(false); setForm({ name: user?.name || '', email: user?.email || '', subject: '', category: 'general', message: '' }); }}
            className="btn-primary">Submit Another Request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Help & Support</h1>
        <p className="text-slate-500">Have a question or need help? We're here for you!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
              <FiMail className="text-primary-600" size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Email Support</h3>
            <p className="text-slate-500 text-sm">support@eventify.com</p>
            <p className="text-slate-400 text-xs mt-1">Response within 24 hours</p>
          </div>
          <div className="card p-5">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
              <FiMessageSquare className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Common Issues</h3>
            <ul className="text-sm text-slate-500 space-y-1 mt-2">
              <li>• Payment failed</li>
              <li>• Ticket not received</li>
              <li>• Event cancellation</li>
              <li>• Refund request</li>
              <li>• Account issues</li>
            </ul>
          </div>
        </div>

        {/* Support Form */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Submit a Support Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Your Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input placeholder="Full name" value={form.name} onChange={e => setField('name', e.target.value)}
                    className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`} />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email Address *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setField('email', e.target.value)}
                    className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)} className="input-field">
                <option value="general">General Inquiry</option>
                <option value="payment">Payment Issue</option>
                <option value="ticket">Ticket Problem</option>
                <option value="refund">Refund Request</option>
                <option value="event">Event Issue</option>
                <option value="account">Account Problem</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Subject *</label>
              <input placeholder="Brief description of your issue" value={form.subject} onChange={e => setField('subject', e.target.value)}
                className={`input-field ${errors.subject ? 'border-red-400' : ''}`} />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Message * <span className="text-slate-400 font-normal">(min 20 characters)</span>
              </label>
              <textarea placeholder="Describe your issue in detail..." rows={5} value={form.message}
                onChange={e => setField('message', e.target.value)}
                className={`input-field ${errors.message ? 'border-red-400' : ''}`} />
              <div className="flex justify-between">
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                <span className="text-xs text-slate-400 ml-auto mt-1">{form.message.length} chars</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Submitting...' : '📨 Submit Support Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
