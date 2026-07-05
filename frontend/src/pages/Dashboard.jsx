import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService, doctorService } from '../services';
import { Navbar } from '../components/Navbar';
import { AppointmentCard } from '../components/AppointmentCard';
import { ListSkeleton } from '../components/LoadingStates';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar, Users, CheckCircle2, Clock, Star, Stethoscope,
  TrendingUp, ArrowRight, Settings,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color = 'indigo', trend }) => {
  const colors = {
    indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-400',  border: 'border-indigo-500/20'  },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-400',    border: 'border-rose-500/20'    },
    amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20'   },
  };
  const c = colors[color];
  return (
    <div className={`glass-card p-5 border ${c.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {trend && <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{trend}</p>}
        </div>
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
};

// ── Patient Dashboard ──────────────────────────────────────────
const PatientDashboard = ({ user }) => {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentService.getAll({ status: 'confirmed', limit: 3 }),
      appointmentService.getAll({ status: 'completed', limit: 3 }),
    ]).then(([u, p]) => {
      setUpcoming(u.data.data.appointments || []);
      setPast(p.data.data.appointments || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      setUpcoming((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }}>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
        <p className="text-slate-400">Manage your health journey from here.</p>
        <Link to="/doctors" className="mt-4 inline-flex items-center gap-2 btn-gradient px-5 py-2.5 rounded-xl text-white text-sm font-medium">
          <Stethoscope className="w-4 h-4" /> Book New Appointment <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Bookings" value={upcoming.length + past.length} color="indigo" />
        <StatCard icon={CheckCircle2} label="Completed" value={past.length} color="emerald" />
        <StatCard icon={Clock} label="Upcoming" value={upcoming.length} color="amber" />
        <StatCard icon={Star} label="Reviews Given" value="0" color="rose" />
      </div>

      {/* Upcoming appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-white">Upcoming Appointments</h3>
          <Link to="/appointments" className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? <ListSkeleton rows={2} /> : upcoming.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No upcoming appointments</p>
            <Link to="/doctors" className="btn-gradient px-5 py-2.5 rounded-xl text-white text-sm">Find a Doctor</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} role="patient" onStatusUpdate={handleStatusUpdate} />)}
          </div>
        )}
      </div>

      {/* Past appointments */}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg text-white mb-4">Recent History</h3>
          <div className="space-y-3">
            {past.map((a) => <AppointmentCard key={a.id} appointment={a} role="patient" onStatusUpdate={() => {}} />)}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Doctor Dashboard ───────────────────────────────────────────
const DoctorDashboard = ({ user }) => {
  const [todayAppts, setTodayAppts] = useState([]);
  const [pending, setPending] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentService.getAll({ status: 'confirmed', limit: 5 }),
      appointmentService.getAll({ status: 'pending', limit: 5 }),
      doctorService.getMyProfile(),
    ]).then(([t, p, d]) => {
      setTodayAppts(t.data.data.appointments || []);
      setPending(p.data.data.appointments || []);
      setDoctorProfile(d.data.data.doctor);
    }).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      setPending((prev) => prev.filter((a) => a.id !== id));
      if (status === 'confirmed') {
        const updated = pending.find((a) => a.id === id);
        if (updated) setTodayAppts((prev) => [{ ...updated, status: 'confirmed' }, ...prev]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.1))' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Good day, Dr. {user.name.split(' ').slice(-1)[0]}! 🩺</h2>
            <p className="text-slate-400">Here's your practice overview.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard/availability" className="flex items-center gap-2 px-4 py-2.5 glass-card border-emerald-500/30 text-emerald-300 text-sm rounded-xl hover:border-emerald-500/50 transition-all">
              <Calendar className="w-4 h-4" /> Manage Slots
            </Link>
            <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 glass-card text-slate-300 text-sm rounded-xl">
              <Settings className="w-4 h-4" /> Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Pending Requests" value={pending.length} color="amber" />
        <StatCard icon={CheckCircle2} label="Confirmed Today" value={todayAppts.length} color="emerald" />
        <StatCard icon={Star} label="Rating" value={doctorProfile?.rating ? Number(doctorProfile.rating).toFixed(1) : '—'} color="rose" />
        <StatCard icon={TrendingUp} label="Total Reviews" value={doctorProfile?.total_reviews || 0} color="indigo" />
      </div>

      {/* Pending requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-white">Pending Requests</h3>
          <Link to="/appointments?status=pending" className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {loading ? <ListSkeleton rows={3} /> : pending.length === 0 ? (
          <div className="glass-card p-6 text-center text-slate-500 text-sm">No pending requests</div>
        ) : (
          <div className="space-y-3">
            {pending.map((a) => <AppointmentCard key={a.id} appointment={a} role="doctor" onStatusUpdate={handleStatusUpdate} />)}
          </div>
        )}
      </div>

      {/* Confirmed schedule */}
      <div>
        <h3 className="font-semibold text-lg text-white mb-4">Confirmed Schedule</h3>
        {loading ? <ListSkeleton rows={2} /> : todayAppts.length === 0 ? (
          <div className="glass-card p-6 text-center text-slate-500 text-sm">No confirmed appointments</div>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((a) => <AppointmentCard key={a.id} appointment={a} role="doctor" onStatusUpdate={handleStatusUpdate} />)}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────
export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-16 page-enter">
        {user?.role === 'doctor' ? (
          <DoctorDashboard user={user} />
        ) : (
          <PatientDashboard user={user} />
        )}
      </div>
    </div>
  );
};
