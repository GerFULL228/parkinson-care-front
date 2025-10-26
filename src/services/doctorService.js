import api from './api';

export const doctorService = {
  getDashboard: async () => {
    const response = await api.get('/api/doctores/dashboard');
    return response.data;
  },

  getPacientes: async () => {
    const response = await api.get('/api/doctores/pacientes');
    return response.data;
  },

  getDetallePaciente: async (pacienteId) => {
    const response = await api.get(`/api/doctores/pacientes/${pacienteId}`);
    return response.data;
  },

  getPerfil: async () => {
    const response = await api.get('/api/doctores/perfil');
    return response.data;
  },

  getCitas: async () => {
    const response = await api.get('/api/citas/mis-citas');
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await api.get('/api/doctores/estadisticas');
    return response.data;
  },
   getDoctores: async () => {
    const response = await api.get('/api/doctores');
    return response.data;
  },

  // ✅ Obtener doctores disponibles en una fecha/hora
  getDoctoresDisponibles: async (fechaHora) => {
    const response = await api.get('/api/citas/doctores-disponibles', {
      params: { fechaHora: fechaHora.toISOString() }
    });
    return response.data;
  },

  // ✅ Obtener información de un doctor específico
  getDoctor: async (id) => {
    const response = await api.get(`/api/doctores/${id}`);
    return response.data;
  },

  // ✅ Buscar doctores por especialidad
  getDoctoresPorEspecialidad: async (especialidad) => {
    const response = await api.get('/api/doctores', {
      params: { especialidad }
    });
    return response.data;
  }

};