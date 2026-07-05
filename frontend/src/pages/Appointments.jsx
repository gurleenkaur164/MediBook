import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services';
import { Navbar } from '../components/Navbar';
import { AppointmentCard } from '../components/AppointmentCard';
import { ListSkeleton, EmptyState } from '../components/LoadingStates';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

export const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...(activeTab !== 'all' && { status: activeTab }) };
      const { data } = await appointmentService.getAll(params);
      setAppointments(data.data.appointments || []);
      setTotal(data.data.total || 0);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [activeTab, page]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 page-enter">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {user?.role === 'doctor' ? 'My Schedule' : 'My Appointments'}
          </h1>
          <p className="text-slate-400">
            {total} appointment{total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <ListSkeleton rows={5} />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No appointments"
            description={activeTab === 'all' ? 'You haven\'t booked any appointments yet.' : `No ${activeTab} appointments.`}
          />
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                role={user?.role}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && !loading && (
          <div className="flex justify-center gap-3 mt-8">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-indigo-500/50 disabled:opacity-40 text-sm">
              Previous
            </button>
            <span className="py-2 text-slate-500 text-sm">Page {page} of {Math.ceil(total / 10)}</span>
            <button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-indigo-500/50 disabled:opacity-40 text-sm">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
