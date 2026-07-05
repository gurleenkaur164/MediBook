import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty'}`}
        />
      ))}
      <span className="text-xs text-slate-400 ml-1">{Number(rating || 0).toFixed(1)}</span>
    </div>
  );
};

export const DoctorCard = ({ doctor }) => {
  const user = doctor.users || {};
  const avatarInitial = user.name?.charAt(0).toUpperCase() || 'D';

  return (
    <Link to={`/doctors/${doctor.id}`} className="block">
      <div className="glass-card card-hover p-5 h-full flex flex-col">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                {avatarInitial}
              </div>
            )}
            {doctor.is_active && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 truncate">{user.name}</h3>
            <p className="text-indigo-400 text-sm font-medium">{doctor.specialization}</p>
            <StarRating rating={doctor.rating} />
            <p className="text-xs text-slate-500 mt-0.5">{doctor.total_reviews} reviews</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-2.5 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">{doctor.experience_yrs || 0} yrs exp.</span>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2.5 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-300">₹{doctor.fee || 0}/visit</span>
          </div>
        </div>

        {/* Location */}
        {doctor.location && (
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-400 truncate">{doctor.location}</span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <div className="w-full py-2.5 text-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/20 transition-colors">
            Book Appointment
          </div>
        </div>
      </div>
    </Link>
  );
};
