import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const doctorService = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
  getSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/slots`, { params: { date } }),
  getAvailability: (doctorId) => api.get(`/doctors/${doctorId}/availability`),
  getReviews: (doctorId, params) => api.get(`/doctors/${doctorId}/reviews`, { params }),
  getMyProfile: () => api.get('/doctors/me'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  setAvailability: (data) => api.post('/doctors/availability', data),
  generateSlots: (doctorId, data) => api.post(`/doctors/${doctorId}/slots/generate`, data),
};

export const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  book: (data) => api.post('/appointments', data),
  updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  getAllUsers: (params) => api.get('/users', { params }),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
};
