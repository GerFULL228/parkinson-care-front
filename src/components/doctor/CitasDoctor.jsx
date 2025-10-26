import React, { useState } from 'react';
import { useApi } from '../../hooks/UseApi';
import { citasService } from '../../services/citaService';

const CitasDoctor = () => {
  const { data: citasData, loading, error, refetch } = useApi(() => 
    citasService.getCitasDoctor()
  );

  const [activeFilter, setActiveFilter] = useState('todas');
  const [message, setMessage] = useState('');

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error al cargar citas: {error}
    </div>
  );

  const citas = citasData?.data || [];

  // Filtrar citas
  const citasFiltradas = citas.filter(cita => {
    const hoy = new Date();
    const citaDate = new Date(cita.fechaHora);
    
    switch (activeFilter) {
      case 'hoy':
        return citaDate.toDateString() === hoy.toDateString();
      case 'programadas':
        return cita.estado === 'PROGRAMADA';
      case 'completadas':
        return cita.estado === 'COMPLETADA';
      case 'proximas':
        return citaDate > hoy && cita.estado === 'PROGRAMADA';
      default:
        return true;
    }
  });

  // Estadísticas
  const estadisticas = {
    total: citas.length,
    hoy: citas.filter(c => new Date(c.fechaHora).toDateString() === new Date().toDateString()).length,
    programadas: citas.filter(c => c.estado === 'PROGRAMADA').length,
    completadas: citas.filter(c => c.estado === 'COMPLETADA').length,
    proximas: citas.filter(c => new Date(c.fechaHora) > new Date() && c.estado === 'PROGRAMADA').length
  };

  const handleActualizarEstado = async (citaId, nuevoEstado) => {
    try {
      const response = await citasService.actualizarEstado(citaId, nuevoEstado);
      
      if (response.success) {
        setMessage(`✅ Cita ${nuevoEstado.toLowerCase()} exitosamente`);
        refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error al actualizar cita: ' + error.response?.data?.message);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PROGRAMADA': return 'bg-green-100 text-green-800';
      case 'CONFIRMADA': return 'bg-blue-100 text-blue-800';
      case 'COMPLETADA': return 'bg-gray-100 text-gray-800';
      case 'CANCELADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProximaCita = () => {
    const citasFuturas = citas.filter(c => 
      new Date(c.fechaHora) > new Date() && c.estado === 'PROGRAMADA'
    );
    return citasFuturas.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))[0];
  };

  const proximaCita = getProximaCita();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('❌') 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Estadísticas y próxima cita */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Próxima cita */}
        {proximaCita && (
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Próxima Cita</h2>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {proximaCita.paciente?.nombre}
                </p>
                <p className="text-gray-600 mt-1">
                  {new Date(proximaCita.fechaHora).toLocaleString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-gray-500 text-sm mt-2">{proximaCita.motivo}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleActualizarEstado(proximaCita.id, 'CONFIRMADA')}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => handleActualizarEstado(proximaCita.id, 'CANCELADA')}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
            <div className="text-sm text-gray-600">Total Citas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{estadisticas.hoy}</div>
            <div className="text-sm text-gray-600">Citas Hoy</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600">{estadisticas.programadas}</div>
            <div className="text-sm text-gray-600">Programadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-600">{estadisticas.completadas}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex space-x-2">
          {[
            { id: 'todas', label: `Todas (${estadisticas.total})` },
            { id: 'hoy', label: `Hoy (${estadisticas.hoy})` },
            { id: 'programadas', label: `Programadas (${estadisticas.programadas})` },
            { id: 'proximas', label: `Próximas (${estadisticas.proximas})` },
            { id: 'completadas', label: `Completadas (${estadisticas.completadas})` }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de citas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {citasFiltradas.length > 0 ? (
          <div className="divide-y">
            {citasFiltradas.map((cita) => (
              <div key={cita.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cita.paciente?.nombre}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(cita.estado)}`}>
                        {cita.estado}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fecha y Hora:</span>
                        <p className="mt-1">
                          {new Date(cita.fechaHora).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Motivo:</span>
                        <p className="mt-1">{cita.motivo}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Contacto:</span>
                        <p className="mt-1">
                          {cita.paciente?.telefono || cita.paciente?.email}
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Duración:</span>
                        <p className="mt-1">30 minutos</p>
                      </div>
                    </div>

                    {cita.notas && (
                      <div className="mt-3">
                        <span className="font-medium text-sm text-gray-700">Notas:</span>
                        <p className="text-sm text-gray-600 mt-1">{cita.notas}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    {cita.estado === 'PROGRAMADA' && (
                      <>
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'CONFIRMADA')}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 whitespace-nowrap"
                        >
                          ✅ Confirmar
                        </button>
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'COMPLETADA')}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                        >
                          ✓ Completar
                        </button>
                        <button
                          onClick={() => handleActualizarEstado(cita.id, 'CANCELADA')}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap"
                        >
                          ❌ Cancelar
                        </button>
                      </>
                    )}
                    
                    {cita.estado === 'CONFIRMADA' && (
                      <button
                        onClick={() => handleActualizarEstado(cita.id, 'COMPLETADA')}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                      >
                        ✓ Marcar como Completada
                      </button>
                    )}

                    <button className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 whitespace-nowrap">
                      📞 Llamar
                    </button>
                    
                    <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 whitespace-nowrap">
                      📝 Notas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-3">
              {activeFilter === 'hoy' ? '📅' : 
               activeFilter === 'programadas' ? '⏳' : 
               activeFilter === 'completadas' ? '✅' : '📋'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeFilter === 'hoy' ? 'No hay citas para hoy' :
               activeFilter === 'programadas' ? 'No hay citas programadas' :
               activeFilter === 'completadas' ? 'No hay citas completadas' :
               'No hay citas registradas'}
            </h3>
            <p className="text-gray-500">
              {activeFilter !== 'todas' && 'Intenta con otro filtro o '}
              Las citas {activeFilter !== 'todas' ? 'de este tipo ' : ''}aparecerán aquí.
            </p>
          </div>
        )}
      </div>

      {/* Información del total */}
      {citasFiltradas.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {citasFiltradas.length} de {citas.length} citas
          {activeFilter !== 'todas' && ` (filtradas por ${activeFilter})`}
        </div>
      )}
    </div>
  );
};

export default CitasDoctor;