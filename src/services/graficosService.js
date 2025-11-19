// services/graficosService.js
import api from './api';

export const graficosService = {
  obtenerDatosTendencias: async (dias = 7) => {
    const response = await api.get(`/api/graficos/tendencias?dias=${dias}`);
    return response.data; // ✅ Devuelve solo data, no toda la respuesta
  },
  
  obtenerDatosComparativa: async () => {
    const response = await api.get('/api/graficos/comparativa');
    return response.data;
  },
  
  obtenerDatosDashboardGraficos: async () => {
    const response = await api.get('/api/dashboard/graficos');
    return response.data;
  }
};

// services/pacienteService.js
export const pacienteService = {
  getDashboard: async () => {
    const response = await api.get('/api/dashboard/principal');
    return response.data;
  }
};

// services/sintomasService.js  
export const sintomasService = {
  getHistorial: async () => {
    const response = await api.get('/api/sintomas');
    return response.data;
  }
};

// Y así para todos los servicios...