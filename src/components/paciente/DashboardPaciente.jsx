import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/UseApi';
import { pacienteService } from '../../services/pacienteService';
import { citasService } from '../../services/citaService';
import { recomendacionesService } from '../../services/recomendacionesService';
import { sintomasService } from '../../services/sintomasService';
import { graficosService } from '../../services/graficosService';
import GraficoTendencias from '../../components/common/GraficoTendencias';
import GraficoComparativa from '../../components/common/GraficoComparativa';

const DashboardPaciente = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  
  // ✅ AHORA: Los servicios devuelven directamente {success, message, data}
  const { data: dashboardData, loading, error, refetch } = useApi(() => 
    pacienteService.getDashboard()
  );
  const { data: sintomasData } = useApi(() => sintomasService.getHistorial());
  const { data: citasData } = useApi(() => citasService.getMisCitas());
  const { data: recomendacionesData } = useApi(() => 
      recomendacionesService.getRecomendaciones()
    );
  const { data: graficosData } = useApi(() => graficosService.obtenerDatosDashboardGraficos());

  // 🔍 DEBUG - Verifica que ahora funciona
  useEffect(() => {
    console.log('=== 🔍 DEBUG CON SOLUCIÓN 2 ===');
    console.log('📊 dashboardData:', dashboardData);
    console.log('📈 sintomasData:', sintomasData);
    console.log('📊 graficosData:', graficosData);
    
    if (dashboardData) {
      console.log('✅ dashboardData.data disponible:', dashboardData.data);
    }
  }, [dashboardData, sintomasData, graficosData]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error: {error}
    </div>
  );

  // ✅ AHORA: Acceso directo y simple
  const stats = dashboardData?.data || {};
  const totalSintomas = sintomasData?.data?.length || 0;

  console.log('🎯 totalSintomas calculado:', totalSintomas);
  console.log('📊 stats completo:', stats);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
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
            onClick={() => setActiveTab('graficos')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'graficos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => setActiveTab('citas')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'citas' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Citas
          </button>
          <button
            onClick={() => setActiveTab('recomendaciones')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'recomendaciones' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Recomendaciones
          </button>
        </div>
      </div>

      {activeTab === 'resumen' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.citasHoy || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">💊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recomendaciones Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recomendacionesPendientes || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Síntomas Registrados</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSintomas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progreso General</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.progreso?.tendencia === 'MEJORANDO' ? '👍' : 
                     stats.progreso?.tendencia === 'EMPEORANDO' ? '👎' : '➡️'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Próxima cita */}
          {stats.proximaCita && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Próxima Cita</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Dr. {stats.proximaCita.doctor?.nombre}
                  </p>
                  <p className="text-gray-600">
                    {new Date(stats.proximaCita.fechaHora).toLocaleString()}
                  </p>
                  <p className="text-gray-500">{stats.proximaCita.motivo}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {stats.proximaCita.estado}
                </span>
              </div>
            </div>
          )}

          {/* Resumen de progreso */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Estadísticas de Síntomas</h2>
              {stats.progreso && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tendencia</label>
                    <p className="text-lg font-semibold text-gray-900">{stats.progreso.tendencia}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Temblor Promedio</label>
                      <p className="text-lg font-semibold">{stats.progreso.promedioTemblor || 0}/10</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Rigidez Promedio</label>
                      <p className="text-lg font-semibold">{stats.progreso.promedioRigidez || 0}/10</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Bradicinesia Promedio</label>
                      <p className="text-lg font-semibold">{stats.progreso.promedioBradicinesia || 0}/10</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Equilibrio Promedio</label>
                      <p className="text-lg font-semibold">{stats.progreso.promedioEquilibrio || 0}/10</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Síntoma más severo</label>
                    <p className="text-lg font-semibold text-red-600">{stats.progreso.sintomaMasSevero || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-semibold">{stats.citasProximas || 0}</span> citas próximas
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">{stats.recomendacionesTotales || 0}</span> recomendaciones totales
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">{stats.recomendacionesPendientes || 0}</span> recomendaciones pendientes
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">{stats.sintomasRegistrados || 0}</span> síntomas registrados
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'graficos' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Análisis Visual de Mi Progreso</h2>
            
            {graficosData?.data ? (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">
                    📈 Evolución de Síntomas (Últimos 7 días)
                  </h3>
                  <GraficoTendencias datos={graficosData.data.tendencias} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-600">
                    📊 Comparativa de Síntomas
                  </h3>
                  <GraficoComparativa datos={graficosData.data.comparativa} />
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">📋 Resumen de Análisis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Mejor controlado:</span>{' '}
                        <span className="text-green-600">
                          {graficosData.data.comparativa?.mejorSintoma || 'N/A'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Más severo:</span>{' '}
                        <span className="text-red-600">
                          {graficosData.data.comparativa?.peorSintoma || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Total de registros analizados:</span>{' '}
                        {graficosData.data.tendencias?.labels?.length || 0} días
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Última actualización:</span>{' '}
                        {new Date(graficosData.data.ultimaActualizacion).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay suficientes datos para mostrar los gráficos
              </div>
            )}
          </div>
        </div>
      )}
       {activeTab === 'citas' && (
        <div className="bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold p-6 border-b">Mis Citas</h2>
          {citasData?.data && citasData.data.length > 0 ? (
            <div className="divide-y">
              {citasData.data.map((cita) => (
                <div key={cita.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Cita con Dr. {cita.doctor?.nombre}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {new Date(cita.fechaHora).toLocaleString()}
                      </p>
                      <p className="text-gray-600">{cita.motivo}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cita.estado === 'PROGRAMADA' ? 'bg-green-100 text-green-800' :
                        cita.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {cita.estado}
                      </span>
                      {cita.estado === 'PROGRAMADA' && (
                        <button
                          onClick={async () => {
                            if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
                              try {
                                await citasService.cancelarCita(cita.id);
                                alert('Cita cancelada exitosamente');
                                refetch();
                              } catch (error) {
                                alert('Error al cancelar cita: ' + error.message);
                              }
                            }
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No tienes citas programadas
            </div>
          )}
        </div>
      )}
{activeTab === 'recomendaciones' && (
  <div className="bg-white rounded-lg shadow-md">
    <h2 className="text-xl font-semibold p-6 border-b">Mis Recomendaciones</h2>
    
    {/* ✅ CORREGIDO: Acceder a la estructura correcta */}
    {recomendacionesData?.data?.recomendaciones && recomendacionesData.data.recomendaciones.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {recomendacionesData.data.recomendaciones
          // ✅ FILTRAR: Solo mostrar recomendaciones activas/aprobadas al paciente
          .filter(recomendacion => 
            recomendacion.estado === 'ACTIVA' || 
            recomendacion.estado === 'APROBADA' || 
            recomendacion.estado === 'MODIFICADA'
          )
          .map((recomendacion) => (
            <div key={recomendacion.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {recomendacion.titulo}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recomendacion.prioridad === 'URGENTE' ? 'bg-red-100 text-red-800' :
                  recomendacion.prioridad === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {recomendacion.prioridad}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{recomendacion.descripcion}</p>
              
              {/* ✅ NUEVO: Mostrar estado si es modificada por doctor */}
              {recomendacion.estado === 'MODIFICADA' && recomendacion.comentariosDoctor && (
                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">Ajustada por tu doctor:</span> {recomendacion.comentariosDoctor}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded mb-1">
                    {recomendacion.categoria}
                  </span>
                  <span className="text-xs text-gray-400">
                    {recomendacion.fechaCreacion && 
                      new Date(recomendacion.fechaCreacion).toLocaleDateString()
                    }
                  </span>
                </div>
                
                {!recomendacion.completada ? (
                  <button
                    onClick={async () => {
                      try {
                        await recomendacionesService.marcarCompletada(recomendacion.id);
                        alert('Recomendación marcada como completada');
                        refetch();
                      } catch (error) {
                        alert('Error al completar recomendación: ' + error.message);
                      }
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Marcar como Completada
                  </button>
                ) : (
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    ✓ Completada
                  </span>
                )}
              </div>
            </div>
          ))
        }
      </div>
    ) : (
      <div className="p-6 text-center text-gray-500">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay recomendaciones disponibles
        </h3>
        <p className="text-gray-500">
          Las recomendaciones generadas por IA deben ser aprobadas por tu doctor primero.
        </p>
        
        {/* ✅ NUEVO: Mostrar si hay recomendaciones pendientes de aprobación */}
        {recomendacionesData?.data?.mensaje && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              {recomendacionesData.data.mensaje}
            </p>
          </div>
        )}
      </div>
    )}
  </div>
)}
    </div>
  );
}
      
    
export default DashboardPaciente;