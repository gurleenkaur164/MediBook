import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, Shield, Star, ArrowRight, CheckCircle2, Clock, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';

const FEATURES = [
  { icon: Stethoscope, title: 'Top Specialists', desc: 'Access 500+ verified doctors across all specializations.' },
  { icon: Calendar, title: 'Instant Booking', desc: 'Book appointments in seconds. No waiting on hold.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your health data is encrypted and fully private.' },
  { icon: Clock, title: '24/7 Available', desc: 'Book anytime, including weekends and holidays.' },
];

const STATS = [
  { label: 'Doctors', value: '500+' },
  { label: 'Patients', value: '10K+' },
  { label: 'Appointments', value: '50K+' },
  { label: 'Specializations', value: '30+' },
];

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Ophthalmology', 'Gynecology',
];

export const Landing = () => {
  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      
      <section style={{ paddingTop: '10rem', paddingBottom: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'center' }} className="page-enter">
          {/* Trust badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.25rem', borderRadius: '9999px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            color: '#818cf8', fontSize: '0.875rem', marginBottom: '2rem'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Trusted by 10,000+ patients
          </div>

          
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, color: 'white', marginBottom: '1.5rem' }}>
            Book the Best<br />
            <span className="gradient-text">Doctors Near You</span>
          </h1>

          
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '38rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Connect with verified specialists, book appointments instantly, and manage your healthcare journey - all in one place.
          </p>

          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/doctors" className="btn-gradient" style={{ padding: '1rem 2rem', borderRadius: '1rem', fontSize: '1.125rem', fontWeight: 600, gap: '0.5rem', textDecoration: 'none' }}>
              Find Doctors
              <ArrowRight style={{ width: 20, height: 20 }} />
            </Link>
            <Link to="/register" style={{
              padding: '1rem 2rem', borderRadius: '1rem', fontSize: '1.125rem', fontWeight: 600,
              border: '1px solid #475569', color: '#cbd5e1', textDecoration: 'none', transition: 'all 0.3s'
            }}>
              Join Free
            </Link>
          </div>

          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2.5rem', fontSize: '0.875rem', color: '#64748b', flexWrap: 'wrap' }}>
            {['No hidden fees', 'Cancel anytime', 'Instant confirmation'].map((text) => (
              <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: '#10b981' }} /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      
      <section style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '3rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
              Why Choose <span className="gradient-text">MediBook</span>?
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '32rem', margin: '0 auto', fontSize: '1.05rem' }}>
              Everything you need to manage your health appointments efficiently.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card card-hover" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '1rem', margin: '0 auto 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}>
                  <Icon style={{ width: 28, height: 28, color: '#818cf8' }} />
                </div>
                <h3 style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: '2.5rem' }}>
            Browse by Specialization
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {SPECIALIZATIONS.map((spec) => (
              <Link
                key={spec}
                to={`/doctors?specialization=${spec}`}
                className="glass-card"
                style={{
                  padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500,
                  color: '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s',
                  borderRadius: '0.75rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#a5b4fc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#cbd5e1'; }}
              >
                {spec}
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/doctors" style={{ color: '#818cf8', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              View all specializations <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-card" style={{
            padding: '4rem 2.5rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
          }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
              Ready to take control of your health?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.05rem' }}>
              Join thousands of patients who book smarter with MediBook.
            </p>
            <Link to="/register" className="btn-gradient" style={{
              padding: '1rem 2rem', borderRadius: '1rem', fontSize: '1.125rem',
              fontWeight: 600, gap: '0.5rem', textDecoration: 'none',
            }}>
              Get Started Free <ArrowRight style={{ width: 20, height: 20 }} />
            </Link>
          </div>
        </div>
      </section>

      
      <footer style={{ borderTop: '1px solid #1e293b', padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}>
            <Stethoscope style={{ width: 14, height: 14, color: 'white' }} />
          </div>
          <span style={{ fontWeight: 600, color: '#cbd5e1' }}>MediBook</span>
        </div>
        <p>© {new Date().getFullYear()} MediBook. Built with love for better healthcare.</p>
      </footer>
    </div>
  );
};
