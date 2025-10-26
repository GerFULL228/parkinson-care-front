import api from './api';

export const recomendacionesService = {
  // ✅ Obtener recomendaciones del paciente
  getRecomendaciones: async () => {
    const response = await api.get('/api/recomendaciones');
    return response.data;
  },

  // ✅ Generar nuevas recomendaciones
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
  }
};