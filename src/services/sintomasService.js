import api from './api';

export const sintomasService = {
  // ✅ REGISTRAR SÍNTOMAS (endpoint corregido)
  registrarSintoma: async (data) => {
    const response = await api.post('/api/sintomas', {
      nivelTemblor: data.nivelTemblor,
      nivelRigidez: data.nivelRigidez,
      nivelBradicinesia: data.nivelBradicinesia,
      nivelEquilibrio: data.nivelEquilibrio,
      sintomasAdicionales: data.sintomasAdicionales || '',
      notas: data.notas || ''
    });
    return response.data;
  },

  // ✅ OBTENER HISTORIAL (endpoint corregido)
  getHistorial: async () => {
    const response = await api.get('/api/sintomas');
    return response.data;
  },

  // ✅ OBTENER ESTADÍSTICAS
  getEstadisticas: async () => {
    const response = await api.get('/api/sintomas/estadisticas');
    return response.data;
  },

  // ✅ NUEVOS MÉTODOS PARA COMPLETAR LA FUNCIONALIDAD

  // Obtener registro específico por ID
  getSintomaPorId: async (id) => {
    const response = await api.get(`/api/sintomas/${id}`);
    return response.data;
  },

  // Actualizar registro
  actualizarSintoma: async (id, data) => {
    const response = await api.put(`/api/sintomas/${id}`, {
      nivelTemblor: data.nivelTemblor,
      nivelRigidez: data.nivelRigidez,
      nivelBradicinesia: data.nivelBradicinesia,
      nivelEquilibrio: data.nivelEquilibrio,
      sintomasAdicionales: data.sintomasAdicionales || '',
      notas: data.notas || ''
    });
    return response.data;
  },

  // Eliminar registro
  eliminarSintoma: async (id) => {
    const response = await api.delete(`/api/sintomas/${id}`);
    return response.data;
  },

  // ✅ MÉTODOS PARA DOCTORES (si es necesario)
  
  // Obtener historial de paciente específico
  getHistorialPaciente: async (pacienteId) => {
    const response = await api.get(`/api/sintomas/paciente/${pacienteId}`);
    return response.data;
  },

  // Registrar síntomas para paciente específico
  registrarSintomaPaciente: async (pacienteId, data) => {
    const response = await api.post(`/api/sintomas/paciente/${pacienteId}`, {
      nivelTemblor: data.nivelTemblor,
      nivelRigidez: data.nivelRigidez,
      nivelBradicinesia: data.nivelBradicinesia,
      nivelEquilibrio: data.nivelEquilibrio,
      sintomasAdicionales: data.sintomasAdicionales || '',
      notas: data.notas || ''
    });
    return response.data;
  },

  // Obtener estadísticas de paciente específico
  getEstadisticasPaciente: async (pacienteId) => {
    const response = await api.get(`/api/sintomas/paciente/${pacienteId}/estadisticas`);
    return response.data;
  },

  // ✅ MÉTODOS ADICIONALES ÚTILES

  // Último registro
  getUltimoRegistro: async () => {
    const response = await api.get('/api/sintomas/ultimo');
    return response.data;
  },

  // Historial por rango de fechas
  getSintomasPorRango: async (fechaInicio, fechaFin) => {
    const response = await api.get('/api/sintomas/rango', {
      params: {
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      }
    });
    return response.data;
  },

  // Resumen de la última semana
  getResumenSemanal: async () => {
    const response = await api.get('/api/sintomas/resumen');
    return response.data;
  }
};

// ✅ CONSTANTES PARA USAR EN REACT
export const NIVEL_SINTOMA = {
  LEVE: 'LEVE',
  MODERADO: 'MODERADO', 
  SEVERO: 'SEVERO'
};

export const TENDENCIA = {
  MEJORANDO: 'MEJORANDO',
  EMPEORANDO: 'EMPEORANDO',
  ESTABLE: 'ESTABLE'
};

// ✅ HELPERS PARA EL FRONTEND
export const calcularSeveridadPromedio = (registro) => {
  const suma = registro.nivelTemblor + registro.nivelRigidez + 
               registro.nivelBradicinesia + registro.nivelEquilibrio;
  return Math.round(suma / 4);
};

export const determinarNivelSeveridad = (promedio) => {
  if (promedio <= 3) return 'LEVE';
  if (promedio <= 7) return 'MODERADO';
  return 'SEVERO';
};

export const formatearFechaSintoma = (fechaHora) => {
  const fecha = new Date(fechaHora);
  return {
    fecha: fecha.toLocaleDateString('es-ES'),
    hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    completa: fecha.toLocaleString('es-ES')
  };
};