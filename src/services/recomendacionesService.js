import api from './api';

export const recomendacionesService = {
  // ✅ Obtener recomendaciones ACTIVAS del paciente (las pendientes no se muestran)
  getRecomendaciones: async () => {
    const response = await api.get('/api/recomendaciones');
    return response.data;
  },

  // ✅ Generar nuevas recomendaciones (con validaciones)
  generarRecomendaciones: async () => {
    const response = await api.post('/api/recomendaciones/generar');
    return response.data;
  },

  // ✅ Obtener solo ejercicios
  getEjercicios: async () => {
    const response = await api.get('/api/recomendaciones/ejercicios');
    return response.data;
  },

  // ✅ Obtener solo consejos
  getConsejos: async () => {
    const response = await api.get('/api/recomendaciones/consejos');
    return response.data;
  },

  // ✅ Marcar recomendación como completada
  marcarCompletada: async (id) => {
    const response = await api.put(`/api/recomendaciones/${id}/completar`);
    return response.data;
  },

  // ✅ Ver estado de IA
  getEstadoIA: async () => {
    const response = await api.get('/api/recomendaciones/estado-ia');
    return response.data;
  },

  // ✅ NUEVO: Obtener recomendaciones de un paciente específico (para doctores)
  getRecomendacionesPaciente: async (pacienteId) => {
    const response = await api.get(`/api/recomendaciones/paciente/${pacienteId}`);
    return response.data;
  }
};