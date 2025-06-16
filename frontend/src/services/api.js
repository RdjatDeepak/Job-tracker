import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

export const jobService = {
  getJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  addJob: async (job) => {
    const response = await api.post('/jobs', job);
    return response.data;
  },

  updateJob: async (id, job) => {
    const response = await api.put(`/jobs/${id}`, job);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

export default api; 