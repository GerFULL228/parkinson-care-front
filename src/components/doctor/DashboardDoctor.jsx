import React, { useState } from 'react';
import { useApi } from '../../hooks/UseApi';
import { doctorService } from '../../services/doctorService';
import { citasService } from '../../services/citaService';

const DashboardDoctor = () => {
  const { data: dashboardData, loading, error } = useApi(() => 
    doctorService.getDashboard()
  );

  const { data: citasData } = useApi(() => citasService.getCitasDoctor());
  const { data: pacientesData } = useApi(() => doctorService.getPacientes());

  const [activeTab, setActiveTab] = useState('resumen');

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error al cargar dashboard: {error}
    </div>
  );

  const dashboard = dashboardData?.data || {};
  const citas = citasData?.data || [];
  const pacientes = pacientesData?.data || [];

  // Filtrar citas de hoy
  const citasHoy = citas.filter(cita => {
    const citaDate = new Date(cita.fechaHora);
    const today = new Date();
    return citaDate.toDateString() === today.toDateString();
  });

  // Citas pendientes (programadas)
  const citasPendientes = citas.filter(cita => cita.estado === 'PROGRAMADA');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Doctor</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'resumen' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('citas')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'citas' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Citas Hoy
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'alertas' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Alertas
          </button>
        </div>
      </div>

      {activeTab === 'resumen' && (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.totalPacientes || pacientes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.citasHoy || citasHoy.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">⏳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.citasPendientes || citasPendientes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🚨</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Alertas Críticas</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.alertasCriticas || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de 2 columnas para información adicional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próxima cita */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Próxima Cita</h2>
              {dashboard.proximaCita ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {dashboard.proximaCita.paciente?.nombre || 'Paciente'}
                      </p>
                      <p className="text-gray-600">
                        {new Date(dashboard.proximaCita.fechaHora).toLocaleString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-gray-500 text-sm">{dashboard.proximaCita.motivo}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      PROGRAMADA
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      Confirmar
                    </button>
                    <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                      Reprogramar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay citas programadas</p>
              )}
            </div>

            {/* Pacientes por etapa */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Pacientes por Etapa</h2>
              {dashboard.pacientesPorEtapa ? (
                <div className="space-y-3">
                  {Object.entries(dashboard.pacientesPorEtapa).map(([etapa, cantidad]) => (
                    <div key={etapa} className="flex justify-between items-center">
                      <span className="text-gray-700">{etapa.replace('_', ' ')}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {cantidad} pacientes
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Etapa 1</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {pacientes.filter(p => p.etapaParkinson === 'ETAPA_1').length} pacientes
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Etapa 2</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                      {pacientes.filter(p => p.etapaParkinson === 'ETAPA_2').length} pacientes
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Etapa 3</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                      {pacientes.filter(p => p.etapaParkinson === 'ETAPA_3').length} pacientes
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{citasPendientes.length}</div>
                <div className="text-sm text-gray-600">Citas Pendientes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {pacientes.filter(p => p.recomendacionesPendientes > 0).length}
                </div>
                <div className="text-sm text-gray-600">Pacientes con Recomendaciones</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {pacientes.filter(p => p.ultimaCita).length}
                </div>
                <div className="text-sm text-gray-600">Pacientes Activos</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'citas' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Citas de Hoy ({citasHoy.length})
            </h2>
          </div>
          
          {citasHoy.length > 0 ? (
            <div className="divide-y">
              {citasHoy.map((cita) => (
                <div key={cita.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cita.paciente?.nombre || 'Paciente'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cita.estado === 'PROGRAMADA' ? 'bg-green-100 text-green-800' :
                          cita.estado === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cita.estado}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Hora:</span>{' '}
                          {new Date(cita.fechaHora).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div>
                          <span className="font-medium">Motivo:</span> {cita.motivo}
                        </div>
                      </div>

                      {cita.paciente?.telefono && (
                        <div className="mt-2">
                          <span className="font-medium text-sm text-gray-700">Contacto:</span>
                          <p className="text-sm text-gray-600">{cita.paciente.telefono}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 whitespace-nowrap">
                        ✅ Completar
                      </button>
                      <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap">
                        📞 Llamar
                      </button>
                      <button className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap">
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No tienes citas para hoy
            </div>
          )}
        </div>
      )}

      {activeTab === 'alertas' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Alertas y Notificaciones
            </h2>
          </div>
          
          <div className="p-6">
            {/* Alertas críticas */}
            {dashboard.alertasCriticas > 0 ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-red-600">🚨</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {dashboard.alertasCriticas} Alertas Críticas
                      </h3>
                      <p className="text-sm text-red-600 mt-1">
                        Pacientes con síntomas graves que requieren atención inmediata
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lista de pacientes con alertas (simulada) */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Pacientes que requieren atención:</h4>
                  {pacientes.slice(0, dashboard.alertasCriticas).map((paciente) => (
                    <div key={paciente.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-900">{paciente.nombre}</p>
                        <p className="text-sm text-red-700">Síntomas severos reportados</p>
                      </div>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                        Revisar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-500 text-4xl mb-3">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin alertas críticas</h3>
                <p className="text-gray-500">Todos los pacientes están estables</p>
              </div>
            )}

            {/* Notificaciones generales */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Notificaciones</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Recomendaciones pendientes de revisión</p>
                    <p className="text-sm text-blue-700">
                      {pacientes.filter(p => p.recomendacionesPendientes > 0).length} pacientes
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Revisar
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-900">Citas por confirmar</p>
                    <p className="text-sm text-yellow-700">
                      {citasPendientes.length} citas pendientes
                    </p>
                  </div>
                  <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                    Ver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDoctor;