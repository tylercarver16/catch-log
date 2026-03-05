import axios from 'axios';

const BASE = '/api';

export const api = {
  // Catches
  getCatches:    ()         => axios.get(`${BASE}/catches`).then(r => r.data),
  getMapCatches: ()         => axios.get(`${BASE}/catches/map`).then(r => r.data),
  getCatch:      (id)       => axios.get(`${BASE}/catches/${id}`).then(r => r.data),
  createCatch:   (form)     => axios.post(`${BASE}/catches`, form).then(r => r.data),
  updateCatch:   (id, data) => axios.put(`${BASE}/catches/${id}`, data).then(r => r.data),
  deleteCatch:   (id)       => axios.delete(`${BASE}/catches/${id}`).then(r => r.data),

  // Bulk import
  bulkImport: (form) => axios.post(`${BASE}/import`, form).then(r => r.data),

  // Settings
  getSettings:    ()     => axios.get(`${BASE}/settings`).then(r => r.data),
  updateSettings: (data) => axios.put(`${BASE}/settings`, data).then(r => r.data),
};
