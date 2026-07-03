import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const inputStyle = (hasError) => ({
  width: '100%', padding: '12px 14px 12px 42px',
  border: hasError ? '2px solid #ef4444' : '2px solid #e5e7eb',
  borderRadius: '12px', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', background: '#f9fafb', color: '#1e293b',
  transition: 'border-color 0.2s'
});

const labelStyle = {
  display: 'block', fontSize: '13px', fontWeight: '600',
  color: '#374151', marginBottom: '6px'
};

const iconStyle = {
  position: 'absolute', left: '14px', top: '50%',
  transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '15px'
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: 'attendee', organizationName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.phone) newErrors.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(form.phone)) newErrors.phone = 'Enter valid 10-digit number';
    if (form.role === 'organizer' && !form.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
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

  const setField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px',
        width: '100%', maxWidth: '520px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: '24px', fontWeight: 'bold', color: 'white'
          }}>E</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px' }}>Create Account</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Join Eventify today — it's free!</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {['attendee', 'organizer'].map(r => (
            <button key={r} type="button" onClick={() => setField('role', r)} style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid',
              borderColor: form.role === r ? '#4f46e5' : '#e5e7eb',
              background: form.role === r ? '#eef2ff' : 'white',
              color: form.role === r ? '#4f46e5' : '#64748b',
              fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s', textTransform: 'capitalize'
            }}>
              {r === 'attendee' ? '🎟️ Attendee' : '🎪 Organizer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={iconStyle} />
                <input placeholder="John Doe" value={form.name} onChange={e => setField('name', e.target.value)} style={inputStyle(errors.name)}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = errors.name ? '#ef4444' : '#e5e7eb'} />
              </div>
              {errors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={iconStyle} />
                <input placeholder="9876543210" value={form.phone} onChange={e => setField('phone', e.target.value)} style={inputStyle(errors.phone)}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = errors.phone ? '#ef4444' : '#e5e7eb'} />
              </div>
              {errors.phone && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>{errors.phone}</p>}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={iconStyle} />
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setField('email', e.target.value)} style={inputStyle(errors.email)}
                onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb'} />
            </div>
            {errors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>{errors.email}</p>}
          </div>

          {/* Organization (organizer only) */}
          {form.role === 'organizer' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Organization Name *</label>
              <div style={{ position: 'relative' }}>
                <FiBriefcase style={iconStyle} />
                <input placeholder="Your Company / College" value={form.organizationName} onChange={e => setField('organizationName', e.target.value)} style={inputStyle(errors.organizationName)}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = errors.organizationName ? '#ef4444' : '#e5e7eb'} />
              </div>
              {errors.organizationName && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>{errors.organizationName}</p>}
            </div>
          )}

          {/* Password + Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={iconStyle} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Min 6 chars" value={form.password} onChange={e => setField('password', e.target.value)}
                  style={{ ...inputStyle(errors.password), paddingRight: '42px' }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af'
                }}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>{errors.password}</p>}
            </div>
            <div>
              <label style={labelStyle}>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={iconStyle} />
                <input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} style={inputStyle(errors.confirmPassword)}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#e5e7eb'} />
              </div>
              {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>{errors.confirmPassword}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(79,70,229,0.4)', transition: 'all 0.2s', marginBottom: '16px'
          }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
