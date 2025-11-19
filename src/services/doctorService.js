import api from './api';

export const doctorService = {
  getDashboard: async () => {
    const response = await api.get('/api/doctores/dashboard');
    return response.data;
  },
  
  // ✅ ENDPOINTS DE CITAS
  getCitasDoctor: async () => {
    try {
      console.log('🟡 Obteniendo citas del doctor desde /api/doctores/citas...');
      const response = await api.get('/api/doctores/citas');
      console.log('📦 Respuesta completa del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔴 Error:', error);
      throw error;
    }
  },

  getCitasBasicas: async () => {
    const response = await api.get('/api/citas/mis-citas-doctor');
    return response.data;
  },
  // ✅ NUEVO: Obtener recomendaciones de un paciente específico
  getRecomendacionesPaciente: async (pacienteId) => {
    const response = await api.get(`/api/doctores/pacientes/${pacienteId}/recomendaciones`);
    return response.data;
  },

  getCitasPaciente: async (pacienteId) => {
    const response = await api.get(`/api/doctores/pacientes/${pacienteId}/citas`);
    return response.data;
  },

  getCitasPacientePorEstado: async (pacienteId, estado) => {
    const response = await api.get(`/api/doctores/pacientes/${pacienteId}/citas/estado/${estado}`);
    return response.data;
  },

  getCitasProximasPaciente: async (pacienteId) => {
    const response = await api.get(`/api/doctores/pacientes/${pacienteId}/citas/proximas`);
    return response.data;
  },

  getTodasCitasDoctor: async () => {
    try {
      console.log('🟡 Obteniendo todas las citas del doctor...');
      const response = await api.get('/api/citas/mis-citas-doctor');
      console.log('📦 Todas las citas:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔴 Error:', error);
      throw error;
    }
  },

  // ✅ ENDPOINTS DE PACIENTES
  getPacientes: async () => {
    const response = await api.get('/api/doctores/pacientes');
    return response.data.data;
  },

  getDetallePaciente: async (pacienteId) => {
    const response = await api.get(`/api/doctores/pacientes/${pacienteId}`);
    return response.data;
  },

  getPerfil: async () => {
    const response = await api.get('/api/doctores/perfil');
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

  getDoctoresDisponibles: async (fechaHora) => {
    const response = await api.get('/api/citas/doctores-disponibles', {
      params: { fechaHora: fechaHora.toISOString() }
    });
    return response.data;
  },

  getDoctor: async (id) => {
    const response = await api.get(`/api/doctores/${id}`);
    return response.data;
  },

  getDoctoresPorEspecialidad: async (especialidad) => {
    const response = await api.get('/api/doctores', {
      params: { especialidad }
    });
    return response.data;
  },

  // ✅ NUEVOS ENDPOINTS PARA GESTIÓN DE RECOMENDACIONES
  getRecomendacionesPendientes: async () => {
    const response = await api.get('/api/doctores/recomendaciones-pendientes');
    return response.data;
  },

  aprobarRecomendacion: async (recomendacionId, comentarios = '') => {
    const response = await api.post(`/api/doctores/recomendaciones/${recomendacionId}/aprobar`, {
      comentarios
    });
    return response.data;
  },

  modificarRecomendacion: async (recomendacionId, modificaciones) => {
    const response = await api.put(`/api/doctores/recomendaciones/${recomendacionId}/modificar`, modificaciones);
    return response.data;
  },

  rechazarRecomendacion: async (recomendacionId, motivo) => {
    const response = await api.post(`/api/doctores/recomendaciones/${recomendacionId}/rechazar`, {
      motivo
    });
    return response.data;
  },

  // ✅ ENDPOINTS DE SÍNTOMAS DE PACIENTES
  getSintomasPaciente: async (pacienteId) => {
    const response = await api.get(`/api/sintomas/paciente/${pacienteId}`);
    return response.data;
  },

  getEstadisticasSintomasPaciente: async (pacienteId) => {
    const response = await api.get(`/api/sintomas/paciente/${pacienteId}/estadisticas`);
    return response.data;
  },

  registrarSintomaPaciente: async (pacienteId, datos) => {
    const response = await api.post(`/api/sintomas/paciente/${pacienteId}`, datos);
    return response.data;
  },

  // ✅ ENDPOINTS ADICIONALES DE CITAS
  getCitasPendientes: async () => {
    const response = await api.get('/api/doctores/citas-pendientes');
    return response.data;
  },

  getEstadisticasCitas: async () => {
    const response = await api.get('/api/doctores/estadisticas-citas');
    return response.data;
  }
};