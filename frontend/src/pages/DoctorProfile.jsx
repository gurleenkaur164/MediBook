import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService, appointmentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { PageLoader } from '../components/LoadingStates';
import toast from 'react-hot-toast';
import {
  Star, MapPin, Clock, DollarSign, Calendar, ChevronLeft,
  ChevronRight, CheckCircle2, Stethoscope, MessageSquare,
} from 'lucide-react';
import { format, addDays, startOfDay, isBefore } from 'date-fns';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((i) => (
      <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty'}`} />
    ))}
    <span className="text-sm text-slate-400 ml-1">{Number(rating||0).toFixed(1)}</span>
  </div>
);

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('in-person');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);

  useEffect(() => {
    Promise.all([
      doctorService.getById(id),
      doctorService.getReviews(id, { limit: 5 }),
    ]).then(([dRes, rRes]) => {
      setDoctor(dRes.data.data.doctor);
      setReviews(rRes.data.data.reviews || []);
    }).catch(() => toast.error('Doctor not found')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setSlotsLoading(true);
    doctorService.getSlots(id, selectedDate)
      .then(({ data }) => { setSlots(data.data.slots || []); setSelectedSlot(null); })
      .catch(() => {})
      .finally(() => setSlotsLoading(false));
  }, [id, selectedDate]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i + dateOffset);
    return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'MMM d'), day: DAYS[d.getDay()] };
  });

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    setBooking(true);
    try {
      await appointmentService.book({
        doctor_id: doctor.id,
        slot_id: selectedSlot.id,
        type,
        notes,
      });
      toast.success('Appointment booked! 🎉');
      navigate('/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!doctor) return <div className="min-h-screen mesh-bg flex items-center justify-center text-slate-400">Doctor not found</div>;

  const docUser = doctor.users || {};

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <div className="glass-card p-6 page-enter">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
                  {docUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">{docUser.name}</h1>
                  <p className="text-indigo-400 font-medium mt-1">{doctor.specialization}</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <StarRating rating={doctor.rating} />
                    <span className="text-slate-400 text-sm">({doctor.total_reviews} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {doctor.location && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-400">
                        <MapPin className="w-4 h-4 text-indigo-400" /> {doctor.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Clock className="w-4 h-4 text-indigo-400" /> {doctor.experience_yrs || 0} years experience
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-semibold">
                      <DollarSign className="w-4 h-4" /> ₹{doctor.fee}/consultation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {doctor.bio && (
              <div className="glass-card p-6">
                <h2 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-400" /> About
                </h2>
                <p className="text-slate-400 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Availability */}
            {doctor.availability?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Weekly Schedule
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {doctor.availability.map((a) => (
                    <div key={a.id} className="bg-slate-800/50 rounded-xl p-3 text-center">
                      <p className="text-indigo-300 font-medium text-sm">{DAYS[a.day_of_week]}</p>
                      <p className="text-slate-400 text-xs mt-1">{a.start_time.slice(0,5)} – {a.end_time.slice(0,5)}</p>
                      <p className="text-slate-600 text-xs">{a.slot_duration_mins} min slots</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" /> Patient Reviews
                </h2>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {r.patient?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-200">{r.patient?.name}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map((i) => (
                                <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'star-filled fill-current' : 'star-empty'}`} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-slate-400 text-sm">{r.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="lg:col-span-1">
            <div className="glass-card p-5 sticky top-24">
              <h2 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" /> Book Appointment
              </h2>

              {/* Date selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setDateOffset(Math.max(0, dateOffset - 7))} disabled={dateOffset === 0} className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                  <span className="text-xs text-slate-400">Select date</span>
                  <button onClick={() => setDateOffset(dateOffset + 7)} className="p-1.5 rounded-lg hover:bg-slate-800">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {dates.map(({ date, label, day }) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all ${
                        selectedDate === date
                          ? 'bg-indigo-500 text-white'
                          : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px]">{day}</span>
                      <span className="font-medium mt-0.5">{label.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">Available slots for {format(new Date(selectedDate + 'T00:00:00'), 'MMMM d')}</p>
                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map((i) => <div key={i} className="h-9 shimmer rounded-lg" />)}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs py-6 bg-slate-800/30 rounded-xl">No slots available</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-indigo-500/50'
                        }`}
                      >
                        {slot.start_time.slice(0,5)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Type */}
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">Appointment type</p>
                <div className="grid grid-cols-2 gap-2">
                  {['in-person', 'online'].map((t) => (
                    <button key={t} onClick={() => setType(t)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                        type === t ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300' : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {t === 'online' ? '💻' : '🏥'} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <p className="text-xs text-slate-400 mb-2">Notes <span className="text-slate-600">(optional)</span></p>
                <textarea
                  rows={3}
                  placeholder="Describe your symptoms or reason for visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field text-sm resize-none"
                />
              </div>

              {selectedSlot && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mb-4 text-xs text-indigo-300">
                  <p className="font-medium">Selected: {format(new Date(selectedDate + 'T00:00:00'), 'MMM d, yyyy')} at {selectedSlot.start_time.slice(0,5)}</p>
                  <p className="text-indigo-400/70 mt-0.5">Fee: ₹{doctor.fee}</p>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={booking || !selectedSlot || user?.role !== 'patient'}
                className="btn-gradient w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {booking ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Confirm Booking</>
                )}
              </button>

              {!user && (
                <p className="text-center text-xs text-slate-500 mt-3">
                  Please <a href="/login" className="text-indigo-400 hover:underline">sign in</a> to book
                </p>
              )}
              {user?.role === 'doctor' && (
                <p className="text-center text-xs text-slate-500 mt-3">Doctors cannot book appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
