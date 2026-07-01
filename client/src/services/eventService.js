import api from './api';

export const eventService = {
  getEvents: (params) => api.get('/events', { params }).then((r) => r.data),
  getEventById: (id) => api.get(`/events/${id}`).then((r) => r.data),
  createEvent: (data) => api.post('/events', data).then((r) => r.data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data).then((r) => r.data),
  deleteEvent: (id) => api.delete(`/events/${id}`).then((r) => r.data),
  getMyEvents: () => api.get('/events/organizer/mine').then((r) => r.data),
  updateSchedule: (id, sessions) => api.put(`/events/${id}/schedule`, { sessions }).then((r) => r.data),
};
