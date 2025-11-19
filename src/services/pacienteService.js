import api from './api';

export const pacienteService = {
  // ✅ Obtener perfil del paciente autenticado
  getPerfil: async () => {
    const response = await api.get('/api/paciente/perfil');
    return response.data;
  },

  // ✅ Actualizar perfil
  updatePerfil: async (data) => {
    const response = await api.put('/api/paciente/perfil', data);
    return response.data;
  },

  // ✅ Dashboard del paciente
  getDashboard: async () => {
    const response = await api.get('/api/dashboard/principal');
    return response.data;
  },

  // ✅ Estadísticas
  getDashboardPrincipal: async () => {
    const response = await api.get('/api/dashboard/principal');
    return response.data;
  },

  getDashboardEstadisticas: async () => {
    const response = await api.get('/api/dashboard/estadisticas');
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await api.get('/api/paciente/estadisticas');
    return response.data;
  },

  // ✅ Historial de síntomas
  getHistorialSintomas: async () => {
    const response = await api.get('/api/sintomas');
    return response.data;
  },

  // ✅ Citas del paciente
  getCitas: async () => {
    const response = await api.get('/api/paciente/citas');
    return response.data;
  },

  // ✅ Recomendaciones (usar recomendacionesService en su lugar)
  getRecomendaciones: async () => {
    const response = await api.get('/api/recomendaciones');
    return response.data;
  },

  // ✅ NUEVO: Generar recomendaciones (usar recomendacionesService en su lugar)
  generarRecomendaciones: async () => {
    const response = await api.post('/api/recomendaciones/generar');
    return response.data;
  }
};