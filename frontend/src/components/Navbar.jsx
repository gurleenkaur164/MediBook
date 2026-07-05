import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services';
import {
  Bell, LogOut, Menu, X, Stethoscope,
  LayoutDashboard, UserCog, ChevronDown,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      notificationService.getAll({ limit: 5 })
        .then(({ data }) => {
          setNotifications(data.data.notifications || []);
          setUnread(data.data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/doctors', label: 'Find Doctors' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    transition: 'all 0.3s',
    ...(scrolled ? {
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
    } : {
      background: 'transparent',
    }),
  };

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}>
              <Stethoscope style={{ width: 18, height: 18, color: 'white' }} />
            </div>
            <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>MediBook</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s',
                  color: location.pathname.startsWith(link.to) ? '#818cf8' : '#cbd5e1',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden md:flex">
            {user ? (
              <>
                {/* Notifications */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    style={{
                      position: 'relative', padding: '0.5rem', borderRadius: '0.5rem', background: 'transparent',
                      border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,41,59,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Bell style={{ width: 20, height: 20, color: '#94a3b8' }} />
                    {unread > 0 && <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>}
                  </button>
                  {notifOpen && (
                    <div className="glass-card" style={{
                      position: 'absolute', right: 0, marginTop: '0.5rem', width: '20rem',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 50,
                    }}>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(51,65,85,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f1f5f9' }}>Notifications</span>
                        <Link to="/notifications" style={{ fontSize: '0.75rem', color: '#818cf8', textDecoration: 'none' }} onClick={() => setNotifOpen(false)}>View all</Link>
                      </div>
                      <div style={{ maxHeight: '18rem', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '2rem 1rem' }}>No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} style={{
                              padding: '0.75rem 1rem', borderBottom: '1px solid rgba(51,65,85,0.3)',
                              background: !n.is_read ? 'rgba(99,102,241,0.05)' : 'transparent',
                              cursor: 'pointer', transition: 'background 0.2s',
                            }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>{n.title}</p>
                              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div style={{ position: 'relative' }} ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30,41,59,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '0.75rem', fontWeight: 700, color: 'white',
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#cbd5e1', maxWidth: '6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                    <ChevronDown style={{ width: 12, height: 12, color: '#64748b', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>
                  {userMenuOpen && (
                    <div className="glass-card" style={{
                      position: 'absolute', right: 0, marginTop: '0.5rem', width: '13rem',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 50,
                    }}>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                        <span style={{
                          display: 'inline-block', marginTop: '0.375rem', fontSize: '0.7rem', padding: '0.125rem 0.5rem',
                          borderRadius: '9999px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.3)', textTransform: 'capitalize',
                        }}>{user.role}</span>
                      </div>
                      <div style={{ padding: '0.25rem 0' }}>
                        {[
                          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                          { to: '/profile', icon: UserCog, label: 'Profile Settings' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
                              fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30,41,59,0.8)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
                          >
                            <Icon style={{ width: 16, height: 16 }} /> {label}
                          </Link>
                        ))}
                        <button onClick={handleLogout}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#fb7185',
                            background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut style={{ width: 16, height: 16 }} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Login
                </Link>
                <Link to="/register" className="btn-gradient" style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: '0.5rem', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {menuOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass-card" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                style={{ padding: '0.5rem 0', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem' }}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ padding: '0.5rem 0', color: '#cbd5e1', textDecoration: 'none' }}>Profile</Link>
                <button onClick={handleLogout} style={{ padding: '0.5rem 0', color: '#fb7185', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>Logout</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, textAlign: 'center', padding: '0.5rem', border: '1px solid #475569',
                  borderRadius: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', textDecoration: 'none',
                }}>Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-gradient" style={{
                  flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
