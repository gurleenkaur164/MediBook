import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authService
        .getMe()
        .then(({ data }) => setUser(data.data.user))
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    const { user, accessToken } = data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
    return user;
  };

  const register = async (formData) => {
    const { data } = await authService.register(formData);
    const { user, accessToken } = data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => setUser((prev) => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
