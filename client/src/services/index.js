import api from './api';

export const registrationService = {
  getMyRegistrations: () => api.get('/registrations/mine').then((r) => r.data),
  getById: (id) => api.get(`/registrations/${id}`).then((r) => r.data),
  cancel: (id) => api.put(`/registrations/${id}/cancel`).then((r) => r.data),
  transfer: (id, data) => api.put(`/registrations/${id}/transfer`, data).then((r) => r.data),
  getEventRegistrations: (eventId) => api.get(`/registrations/event/${eventId}`).then((r) => r.data),
  exportEventRegistrations: (eventId) =>
    api.get(`/registrations/event/${eventId}/export`, { responseType: 'blob' }).then((r) => r.data),
  checkIn: (ticketCode) => api.put(`/registrations/checkin/${ticketCode}`).then((r) => r.data),
};

export const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data).then((r) => r.data),
  verifyPayment: (data) => api.post('/payments/verify', data).then((r) => r.data),
};

export const analyticsService = {
  getEventAnalytics: (eventId) => api.get(`/analytics/event/${eventId}`).then((r) => r.data),
  getOrganizerOverview: () => api.get('/analytics/organizer/overview').then((r) => r.data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getUsers: () => api.get('/admin/users').then((r) => r.data),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/block`).then((r) => r.data),
  getEvents: (status) => api.get('/admin/events', { params: { status } }).then((r) => r.data),
  approveEvent: (id) => api.put(`/admin/events/${id}/approve`).then((r) => r.data),
  rejectEvent: (id) => api.put(`/admin/events/${id}/reject`).then((r) => r.data),
  getPayments: () => api.get('/admin/payments').then((r) => r.data),
};
