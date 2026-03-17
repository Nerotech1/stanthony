import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Settings
  getSettings: () => axios.get(`${API}/settings`),
  updateSettings: (data) => axios.put(`${API}/settings`, data, { headers: getAuthHeader() }),

  // Auth
  login: (email, password) => axios.post(`${API}/auth/login`, { email, password }),
  register: (email, password, name) => axios.post(`${API}/auth/register`, { email, password, name }),
  getMe: () => axios.get(`${API}/auth/me`, { headers: getAuthHeader() }),

  // Pages
  getPages: () => axios.get(`${API}/pages`),
  getPage: (slug) => axios.get(`${API}/pages/${slug}`),
  createPage: (data) => axios.post(`${API}/pages`, data, { headers: getAuthHeader() }),
  updatePage: (slug, data) => axios.put(`${API}/pages/${slug}`, data, { headers: getAuthHeader() }),
  deletePage: (slug) => axios.delete(`${API}/pages/${slug}`, { headers: getAuthHeader() }),

  // Sections
  getSections: (pageSlug) => axios.get(`${API}/sections${pageSlug ? `?page_slug=${pageSlug}` : ''}`),
  createSection: (data) => axios.post(`${API}/sections`, data, { headers: getAuthHeader() }),
  updateSection: (id, data) => axios.put(`${API}/sections/${id}`, data, { headers: getAuthHeader() }),
  deleteSection: (id) => axios.delete(`${API}/sections/${id}`, { headers: getAuthHeader() }),
  reorderSections: (orders) => axios.put(`${API}/sections/reorder`, orders, { headers: getAuthHeader() }),

  // Sermons
  getSermons: (publishedOnly = true) => axios.get(`${API}/sermons?published_only=${publishedOnly}`),
  getSermon: (id) => axios.get(`${API}/sermons/${id}`),
  createSermon: (data) => axios.post(`${API}/sermons`, data, { headers: getAuthHeader() }),
  updateSermon: (id, data) => axios.put(`${API}/sermons/${id}`, data, { headers: getAuthHeader() }),
  deleteSermon: (id) => axios.delete(`${API}/sermons/${id}`, { headers: getAuthHeader() }),

  // Events
  getEvents: (publishedOnly = true) => axios.get(`${API}/events?published_only=${publishedOnly}`),
  getEvent: (id) => axios.get(`${API}/events/${id}`),
  createEvent: (data) => axios.post(`${API}/events`, data, { headers: getAuthHeader() }),
  updateEvent: (id, data) => axios.put(`${API}/events/${id}`, data, { headers: getAuthHeader() }),
  deleteEvent: (id) => axios.delete(`${API}/events/${id}`, { headers: getAuthHeader() }),

  // Gallery
  getGallery: (category) => axios.get(`${API}/gallery${category ? `?category=${category}` : ''}`),
  getGalleryCategories: () => axios.get(`${API}/gallery/categories`),
  createGalleryImage: (data) => axios.post(`${API}/gallery`, data, { headers: getAuthHeader() }),
  updateGalleryImage: (id, data) => axios.put(`${API}/gallery/${id}`, data, { headers: getAuthHeader() }),
  deleteGalleryImage: (id) => axios.delete(`${API}/gallery/${id}`, { headers: getAuthHeader() }),

  // Messages
  getMessages: () => axios.get(`${API}/messages`, { headers: getAuthHeader() }),
  sendMessage: (data) => axios.post(`${API}/messages`, data),
  markMessageRead: (id) => axios.put(`${API}/messages/${id}/read`, {}, { headers: getAuthHeader() }),
  deleteMessage: (id) => axios.delete(`${API}/messages/${id}`, { headers: getAuthHeader() }),

  // Announcements
  getAnnouncements: (activeOnly = true) => axios.get(`${API}/announcements?active_only=${activeOnly}`),
  createAnnouncement: (data) => axios.post(`${API}/announcements`, data, { headers: getAuthHeader() }),
  updateAnnouncement: (id, data) => axios.put(`${API}/announcements/${id}`, data, { headers: getAuthHeader() }),
  deleteAnnouncement: (id) => axios.delete(`${API}/announcements/${id}`, { headers: getAuthHeader() }),

  // Clergy
  getClergy: (activeOnly = true) => axios.get(`${API}/clergy?active_only=${activeOnly}`),
  createClergy: (data) => axios.post(`${API}/clergy`, data, { headers: getAuthHeader() }),
  updateClergy: (id, data) => axios.put(`${API}/clergy/${id}`, data, { headers: getAuthHeader() }),
  deleteClergy: (id) => axios.delete(`${API}/clergy/${id}`, { headers: getAuthHeader() }),

  // Donations
  createDonationCheckout: (data) => axios.post(`${API}/donations/checkout`, data),
  getDonationStatus: (sessionId) => axios.get(`${API}/donations/status/${sessionId}`),
  getDonations: () => axios.get(`${API}/donations`, { headers: getAuthHeader() }),

  // Stats
  getStats: () => axios.get(`${API}/stats`, { headers: getAuthHeader() }),

  // Seed
  seedData: () => axios.post(`${API}/seed`),
};

export default api;
