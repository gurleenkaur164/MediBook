import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, doctorService } from '../services';
import { Navbar } from '../components/Navbar';
import { PageLoader } from '../components/LoadingStates';
import toast from 'react-hot-toast';
import { User, Lock, Stethoscope, Save, Camera } from 'lucide-react';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
];

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || '',
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [doctorForm, setDoctorForm] = useState({
    specialization: '',
    bio: '',
    location: '',
    fee: '',
    experience_yrs: '',
  });

  useEffect(() => {
    if (user?.role === 'doctor') {
      doctorService.getMyProfile()
        .then(({ data }) => {
          const doc = data.data.doctor;
          setDoctorProfile(doc);
          setDoctorForm({
            specialization: doc.specialization || '',
            bio: doc.bio || '',
            location: doc.location || '',
            fee: doc.fee || '',
            experience_yrs: doc.experience_yrs || '',
          });
        })
        .catch(() => {});
    }
  }, [user]);

  const handlePersonalSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userService.updateProfile(personalForm);
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await userService.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorService.updateProfile({
        ...doctorForm,
        fee: Number(doctorForm.fee),
        experience_yrs: Number(doctorForm.experience_yrs),
      });
      toast.success('Doctor profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <PageLoader />;

  const tabs = user.role === 'doctor'
    ? [...TABS, { id: 'doctor', label: 'Practice Info', icon: Stethoscope }]
    : TABS;

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16 page-enter">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-slate-400">Manage your account information and preferences</p>
        </div>

        {/* Avatar */}
        <div className="glass-card p-6 mb-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg">{user.name}</h2>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">{user.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === id ? 'bg-indigo-500 text-white' : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="glass-card p-6">
            <form onSubmit={handlePersonalSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input type="text" value={personalForm.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                  className="input-field" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input type="email" value={user.email} disabled
                  className="input-field opacity-50 cursor-not-allowed" />
                <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input type="tel" value={personalForm.phone}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Avatar URL</label>
                <input type="url" value={personalForm.avatar_url}
                  onChange={(e) => setPersonalForm({ ...personalForm, avatar_url: e.target.value })}
                  className="input-field" placeholder="https://example.com/avatar.jpg" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-5">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input type="password" required value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  className="input-field" placeholder="Current password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input type="password" required minLength={6} value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className="input-field" placeholder="Minimum 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <input type="password" required value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  className="input-field" placeholder="Repeat new password" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-gradient w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Doctor Tab */}
        {activeTab === 'doctor' && user.role === 'doctor' && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-5">Practice Information</h3>
            <form onSubmit={handleDoctorSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Specialization</label>
                <input type="text" value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="input-field" placeholder="e.g. Cardiology" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location / Clinic</label>
                <input type="text" value={doctorForm.location}
                  onChange={(e) => setDoctorForm({ ...doctorForm, location: e.target.value })}
                  className="input-field" placeholder="e.g. Apollo Hospital, Mumbai" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Fee (₹)</label>
                  <input type="number" min="0" value={doctorForm.fee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, fee: e.target.value })}
                    className="input-field" placeholder="500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Experience (years)</label>
                  <input type="number" min="0" value={doctorForm.experience_yrs}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience_yrs: e.target.value })}
                    className="input-field" placeholder="5" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea rows={4} value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                  className="input-field resize-none" placeholder="Tell patients about yourself, your experience, and approach..." />
              </div>
              <button type="submit" disabled={loading}
                className="btn-gradient w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Practice Info'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
