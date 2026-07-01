import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'attendee',
    organizationName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created successfully!');
      navigate(data.role === 'organizer' ? '/organizer' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p className="text-slate-500 mb-6">Join Eventify as an attendee or organizer.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            {['attendee', 'organizer'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`flex-1 py-2.5 rounded-lg border-2 font-medium capitalize transition-colors ${
                  form.role === r ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <input
            placeholder="Full Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-field"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-field"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input-field"
          />
          {form.role === 'organizer' && (
            <input
              placeholder="Organization Name"
              value={form.organizationName}
              onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))}
              className="input-field"
            />
          )}
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input-field"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
