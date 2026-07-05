import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import { Landing }            from './pages/Landing';
import { Login }              from './pages/Login';
import { Register }           from './pages/Register';
import { DoctorList }         from './pages/DoctorList';
import { DoctorProfile }      from './pages/DoctorProfile';
import { Dashboard }          from './pages/Dashboard';
import { Appointments }       from './pages/Appointments';
import { AvailabilityManager } from './pages/AvailabilityManager';
import { Profile }            from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#f43f5e', secondary: '#1e293b' } },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />

          {/* Auth (redirect to /dashboard if already logged in) */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected — any authenticated user */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Protected — doctor only */}
          <Route
            path="/dashboard/availability"
            element={<ProtectedRoute roles={['doctor']}><AvailabilityManager /></ProtectedRoute>}
          />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen mesh-bg flex items-center justify-center text-center px-4">
              <div>
                <p className="text-8xl font-black gradient-text mb-4">404</p>
                <p className="text-slate-400 mb-6">Page not found</p>
                <a href="/" className="btn-gradient px-6 py-3 rounded-xl text-white font-semibold">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
