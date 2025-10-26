import api from './api';

export const citasService = {
  // ✅ Crear nueva cita (actualizado)
  crearCita: async (data) => {
    const response = await api.post('/api/citas', {
      pacienteId: data.pacienteId,
      doctorId: data.doctorId,
      fechaHora: data.fechaHora,
      motivo: data.motivo,
      notas: data.notas || '' // Campo adicional
    });
    return response.data;
  },

  // ✅ Obtener citas del paciente autenticado
  getMisCitas: async () => {
    const response = await api.get('/api/citas/mis-citas');
    return response.data;
  },

  // ✅ Obtener citas del doctor autenticado
  getCitasDoctor: async () => {
    const response = await api.get('/api/citas/mis-citas');
    return response.data;
  },

  // ✅ Obtener doctores disponibles (actualizado)
  getDoctoresDisponibles: async (fechaHora) => {
    const response = await api.get('/api/citas/doctores-disponibles', {
      params: { fechaHora: fechaHora.toISOString() }
    });
    return response.data;
  },

  // ✅ Cancelar cita (actualizado - ahora usa PUT)
  cancelarCita: async (id) => {
    const response = await api.put(`/api/citas/${id}/cancelar`);
    return response.data;
  },

  // ✅ Reprogramar cita (actualizado - ahora usa request body)
  reprogramarCita: async (id, nuevaFechaHora) => {
    const response = await api.put(`/api/citas/${id}/reprogramar`, {
      nuevaFechaHora: nuevaFechaHora.toISOString()
    });
    return response.data;
  },

  // ✅ Actualizar estado de cita (actualizado)
  actualizarEstado: async (id, nuevoEstado) => {
    const response = await api.put(`/api/citas/${id}/estado`, {
      nuevoEstado: nuevoEstado
    });
    return response.data;
  },

  // ✅ NUEVO: Obtener cita específica por ID
  getCita: async (id) => {
    const response = await api.get(`/api/citas/${id}`);
    return response.data;
  },

  // ✅ NUEVO: Obtener citas próximas
  getCitasProximas: async () => {
    const response = await api.get('/api/citas/proximas');
    return response.data;
  },

  // ✅ NUEVO: Obtener citas de hoy
  getCitasHoy: async () => {
    const response = await api.get('/api/citas/hoy');
    return response.data;
  },

  // ✅ NUEVO: Filtrar citas con múltiples criterios
  filtrarCitas: async (filtros) => {
    const response = await api.post('/api/citas/filtrar', filtros);
    return response.data;
  },

  // ✅ NUEVO: Obtener estadísticas de citas
  getEstadisticas: async () => {
    const response = await api.get('/api/citas/estadisticas');
    return response.data;
  },

  // ✅ NUEVO: Buscar citas por rango de fechas
  buscarPorRango: async (fechaInicio, fechaFin) => {
    const response = await api.get('/api/citas/buscar', {
      params: {
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      }
    });
    return response.data;
  },

  // ✅ NUEVO: Obtener citas de un paciente específico (para doctores/admin)
  getCitasPaciente: async (pacienteId) => {
    const response = await api.get(`/api/citas/paciente/${pacienteId}`);
    return response.data;
  },

  // ✅ NUEVO: Verificar si se puede actualizar una cita
  puedeActualizarCita: async (citaId) => {
    try {
      // Intentamos obtener la cita con permisos
      const response = await api.get(`/api/citas/${citaId}`);
      return response.data.success;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return false;
    }
  }
};

// ✅ Tipos de estado de cita para usar en React
export const ESTADO_CITA = {
  PROGRAMADA: 'PROGRAMADA',
  CONFIRMADA: 'CONFIRMADA',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
  REPROGRAMADA: 'REPROGRAMADA'
};

// ✅ Helper para formatear fechas
export const formatFechaCita = (fechaHora) => {
  const fecha = new Date(fechaHora);
  return {
    fecha: fecha.toLocaleDateString('es-ES'),
    hora: fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    completa: fecha.toLocaleString('es-ES')
  };
};

// ✅ Helper para validar si una cita puede ser cancelada
export const puedeCancelarCita = (cita) => {
  if (!cita) return false;
  
  const fechaCita = new Date(cita.fechaHora);
  const ahora = new Date();
  const diferenciaHoras = (fechaCita - ahora) / (1000 * 60 * 60);
  
  // Solo se puede cancelar con al menos 2 horas de anticipación
  return cita.estado === ESTADO_CITA.PROGRAMADA && diferenciaHoras >= 2;
};

// ✅ Helper para validar si una cita puede ser reprogramada
export const puedeReprogramarCita = (cita) => {
  if (!cita) return false;
  
  const fechaCita = new Date(cita.fechaHora);
  const ahora = new Date();
  const diferenciaHoras = (fechaCita - ahora) / (1000 * 60 * 60);
  
  // Solo se puede reprogramar con al menos 4 horas de anticipación
  return (cita.estado === ESTADO_CITA.PROGRAMADA || 
          cita.estado === ESTADO_CITA.CONFIRMADA) && 
         diferenciaHoras >= 4;
};