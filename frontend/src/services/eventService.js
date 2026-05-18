import API from './api';

export const register  = (data)      => API.post('/auth/register', data);
export const login     = (data)      => API.post('/auth/login', data);
export const getProfile = ()         => API.get('/auth/profile');
export const updateProfile = (data)  => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

export const getEvents   = (params) => API.get('/events', { params });
export const getEvent    = (id)     => API.get(`/events/${id}`);
export const createEvent = (data)   => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateEvent = (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteEvent = (id)     => API.delete(`/events/${id}`);
export const patchEventStatus = (id, status) => API.patch(`/events/${id}/status`, { status });

export const getCategories  = ()     => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const deleteCategory = (id)   => API.delete(`/categories/${id}`);

export const getSeats  = (event_id)       => API.get(`/seats/event/${event_id}`);
export const lockSeats = (event_id, seat_ids) => API.post('/seats/lock', { event_id, seat_ids });

export const createBooking  = (data) => API.post('/bookings', data);
export const getMyBookings  = (params) => API.get('/bookings/my', { params });
export const getBooking     = (id)   => API.get(`/bookings/${id}`);
export const cancelBooking  = (id)   => API.patch(`/bookings/${id}/cancel`);
export const getAllBookings  = (params) => API.get('/bookings/all', { params });

export const getPayment     = (booking_id) => API.get(`/payments/booking/${booking_id}`);
export const getAllPayments  = (params) => API.get('/payments/all', { params });
export const getRevenueSummary = () => API.get('/payments/revenue');

export const getOrganizerDashboard = () => API.get('/organizer/dashboard');
export const getOrganizerEvents    = (params) => API.get('/organizer/events', { params });
export const getEventBookings      = (event_id, params) => API.get(`/organizer/events/${event_id}/bookings`, { params });
export const getOrganizerRevenue   = () => API.get('/organizer/revenue');

export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAdminUsers     = (params) => API.get('/admin/users', { params });
export const toggleUser        = (id) => API.patch(`/admin/users/${id}/toggle`);
export const deleteUser        = (id) => API.delete(`/admin/users/${id}`);
export const getAdminEvents    = (params) => API.get('/admin/events', { params });
export const getAdminReports   = () => API.get('/admin/reports');
