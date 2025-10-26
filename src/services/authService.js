import api from './api';

export const authService = {
    login: async (username, password) => {
    const response = await api.post('/api/auth/login', { 
      username, 
      password 
    });
    return response.data; // {success, message, data}
  },

  registerPaciente: async (userData) => {
    const response = await api.post('/api/auth/registro/paciente', userData);
    return response.data;
  },

  registerDoctor: async (userData) => {
    const response = await api.post('/api/auth/registro/doctor', userData);
    return response.data;
  },

  registerAdmin: async (userData) => {
    const response = await api.post('/api/auth/registro/admin', userData);
    return response.data;
  }
};