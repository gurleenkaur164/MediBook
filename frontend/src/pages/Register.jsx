import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Stethoscope, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';

const ROLES = [
  { value: 'patient', label: "🧑‍⚕️ I'm a Patient", desc: 'Book appointments with doctors' },
  { value: 'doctor',  label: "👨‍⚕️ I'm a Doctor",  desc: 'Manage your practice and schedule' },
];

export const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to MediBook 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { position: 'absolute', left: 12, top: 14, width: 16, height: 16, color: '#64748b' };

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }} className="page-enter">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: 42, height: 42, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}>
              <Stethoscope style={{ width: 22, height: 22, color: 'white' }} />
            </div>
            <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700 }}>MediBook</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Create your account</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Join thousands managing their health smarter</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {ROLES.map((role) => (
              <button key={role.value} type="button" onClick={() => setForm({ ...form, role: role.value })}
                style={{
                  padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  background: form.role === role.value ? 'rgba(99,102,241,0.1)' : 'transparent',
                  border: `1px solid ${form.role === role.value ? '#6366f1' : '#334155'}`,
                }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>{role.label}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.3 }}>{role.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={iconStyle} />
                <input type="text" required minLength={2} placeholder="Dr. John Smith"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={iconStyle} />
                <input type="email" required placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Phone <span style={{ color: '#475569' }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone style={iconStyle} />
                <input type="tel" placeholder="+91 98765 43210"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={iconStyle} />
                <input type={showPass ? 'text' : 'password'} required minLength={6} placeholder="Minimum 6 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gradient"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600, gap: '0.5rem', marginTop: '0.5rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <>Create Account <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(51,65,85,0.5)', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
