import { format } from 'date-fns';
import { Calendar, Clock, User, Stethoscope, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'badge-pending'   },
  confirmed: { label: 'Confirmed', cls: 'badge-confirmed' },
  rejected:  { label: 'Rejected',  cls: 'badge-rejected'  },
  cancelled: { label: 'Cancelled', cls: 'badge-cancelled' },
  completed: { label: 'Completed', cls: 'badge-completed' },
};

export const AppointmentCard = ({ appointment, onStatusUpdate, role }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slot = appointment.time_slots;
  const doctor = appointment.doctor;
  const patient = appointment.patient;
  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;

  const doctorName = doctor?.users?.name || 'Doctor';
  const patientName = patient?.name || 'Patient';
  const displayName = role === 'patient' ? doctorName : patientName;
  const displaySub = role === 'patient' ? doctor?.specialization : patient?.email;

  const dateStr = slot?.date ? format(new Date(slot.date), 'EEE, MMM d yyyy') : 'TBD';
  const timeStr = slot?.start_time ? slot.start_time.slice(0, 5) : 'TBD';

  const doctorActions = appointment.status === 'pending'
    ? ['confirmed', 'rejected']
    : appointment.status === 'confirmed'
    ? ['completed']
    : [];

  const patientActions = ['pending', 'confirmed'].includes(appointment.status) ? ['cancelled'] : [];
  const actions = role === 'doctor' ? doctorActions : patientActions;

  return (
    <div className="glass-card p-4 hover:border-indigo-500/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base font-bold flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-100 text-sm truncate">{displayName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{displaySub}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" /> {dateStr}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" /> {timeStr}
              </span>
              <span className="flex items-center gap-1 text-xs text-indigo-400 capitalize">
                {appointment.type}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 glass-card shadow-lg z-10 overflow-hidden">
                {actions.map((action) => (
                  <button
                    key={action}
                    onClick={() => { onStatusUpdate(appointment.id, action); setMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs capitalize transition-colors ${
                      action === 'confirmed' ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : action === 'rejected' || action === 'cancelled' ? 'text-rose-400 hover:bg-rose-500/10'
                      : 'text-indigo-400 hover:bg-indigo-500/10'
                    }`}
                  >
                    Mark as {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {appointment.notes && (
        <p className="mt-3 text-xs text-slate-500 bg-slate-800/50 rounded-lg p-2 line-clamp-2">
          📝 {appointment.notes}
        </p>
      )}
    </div>
  );
};
