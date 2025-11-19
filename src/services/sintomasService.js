import api from './api';

export const sintomasService = {
  // ✅ REGISTRAR SÍNTOMAS
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

  // ✅ OBTENER HISTORIAL
  getHistorial: async () => {
    const response = await api.get('/api/sintomas');
    return response.data;
  },

  // ✅ OBTENER ESTADÍSTICAS
  getEstadisticas: async () => {
    const response = await api.get('/api/sintomas/estadisticas');
    return response.data;
  },

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

  // ✅ MÉTODOS PARA DOCTORES
  getHistorialPaciente: async (pacienteId) => {
    const response = await api.get(`/api/sintomas/paciente/${pacienteId}`);
    return response.data;
  },

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

  getEstadisticasPaciente: async (pacienteId) => {
    const response = await api.get(`/api/sintomas/paciente/${pacienteId}/estadisticas`);
    return response.data;
  },

  // ✅ MÉTODOS ADICIONALES ÚTILES
  getUltimoRegistro: async () => {
    const response = await api.get('/api/sintomas/ultimo');
    return response.data;
  },

  getSintomasPorRango: async (fechaInicio, fechaFin) => {
    const response = await api.get('/api/sintomas/rango', {
      params: {
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      }
    });
    return response.data;
  },

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

// ✅ CONSTANTES PARA ESTADOS DE RECOMENDACIONES
export const ESTADO_RECOMENDACION = {
  PENDIENTE_APROBACION: 'PENDIENTE_APROBACION',
  APROBADA: 'APROBADA',
  MODIFICADA: 'MODIFICADA',
  RECHAZADA: 'RECHAZADA',
  ACTIVA: 'ACTIVA'
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

// ✅ HELPER PARA DETERMINAR COLOR DE PRIORIDAD
export const getColorPrioridad = (prioridad) => {
  switch (prioridad) {
    case 'URGENTE': return 'bg-red-100 text-red-800 border-red-200';
    case 'ALTA': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIA': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'BAJA': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// ✅ HELPER PARA DETERMINAR COLOR DE ESTADO
export const getColorEstado = (estado) => {
  switch (estado) {
    case 'PENDIENTE_APROBACION': return 'bg-yellow-100 text-yellow-800';
    case 'APROBADA': return 'bg-green-100 text-green-800';
    case 'MODIFICADA': return 'bg-blue-100 text-blue-800';
    case 'RECHAZADA': return 'bg-red-100 text-red-800';
    case 'ACTIVA': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};