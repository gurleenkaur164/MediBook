import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services';
import { Navbar } from '../components/Navbar';
import { PageLoader } from '../components/LoadingStates';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, RefreshCw, Clock } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultSlot = (dayOfWeek) => ({
  day_of_week: dayOfWeek,
  start_time: '09:00',
  end_time: '17:00',
  slot_duration_mins: 30,
});

export const AvailabilityManager = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    doctorService.getMyProfile()
      .then(({ data }) => {
        const doc = data.data.doctor;
        setDoctorId(doc.id);
        setAvailability(doc.availability || []);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const addDay = (dayOfWeek) => {
    if (availability.find((a) => a.day_of_week === dayOfWeek)) {
      toast.error(`${DAYS[dayOfWeek]} is already added`);
      return;
    }
    setAvailability([...availability, defaultSlot(dayOfWeek)].sort((a, b) => a.day_of_week - b.day_of_week));
  };

  const removeDay = (dayOfWeek) => {
    setAvailability(availability.filter((a) => a.day_of_week !== dayOfWeek));
  };

  const updateDay = (dayOfWeek, field, value) => {
    setAvailability(availability.map((a) =>
      a.day_of_week === dayOfWeek ? { ...a, [field]: value } : a
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorService.setAvailability({ availability });
      toast.success('Availability saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSlots = async () => {
    if (!doctorId) return;
    setGenerating(true);
    try {
      const { data } = await doctorService.generateSlots(doctorId, { days: 14 });
      toast.success(`Generated ${data.data.slots?.length || 0} slots for the next 14 days!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Slot generation failed');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <PageLoader />;

  const unusedDays = DAYS.filter((_, i) => !availability.find((a) => a.day_of_week === i));

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 page-enter">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-indigo-400" /> Availability Manager
          </h1>
          <p className="text-slate-400">Set your weekly schedule. Slots will be auto-generated.</p>
        </div>

        {/* Current schedule */}
        <div className="space-y-4 mb-6">
          {availability.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-2">No availability set yet</p>
              <p className="text-slate-500 text-sm">Add working days below to get started</p>
            </div>
          ) : (
            availability.map((a) => (
              <div key={a.day_of_week} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-indigo-300">{DAYS[a.day_of_week]}</h3>
                  <button
                    onClick={() => removeDay(a.day_of_week)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                    <input
                      type="time"
                      value={a.start_time}
                      onChange={(e) => updateDay(a.day_of_week, 'start_time', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">End Time</label>
                    <input
                      type="time"
                      value={a.end_time}
                      onChange={(e) => updateDay(a.day_of_week, 'end_time', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Slot Duration</label>
                    <select
                      value={a.slot_duration_mins}
                      onChange={(e) => updateDay(a.day_of_week, 'slot_duration_mins', Number(e.target.value))}
                      className="input-field text-sm"
                    >
                      <option value={15}>15 min</option>
                      <option value={20}>20 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add day */}
        {unusedDays.length > 0 && (
          <div className="glass-card p-4 mb-6">
            <p className="text-sm text-slate-400 mb-3">Add working days:</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day, i) => {
                const isAdded = !!availability.find((a) => a.day_of_week === i);
                return (
                  <button
                    key={day}
                    onClick={() => addDay(i)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isAdded
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 cursor-default'
                        : 'border border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-300'
                    }`}
                  >
                    {isAdded ? '✓ ' : '+ '}{day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Schedule'}
          </button>
          <button
            onClick={handleGenerateSlots}
            disabled={generating || availability.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-all disabled:opacity-40 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Generate Slots (14 days)
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-4 text-center">
          After saving your schedule, click "Generate Slots" to create bookable time slots for the next 14 days.
        </p>
      </div>
    </div>
  );
};
