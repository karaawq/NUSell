import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || '') +'/api'
}); //if url empty it js goes back to /api (if running locally)

// auto-attach jwt tokwn to every request?
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nusell_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;