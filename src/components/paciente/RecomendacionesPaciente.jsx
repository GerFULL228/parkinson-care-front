import React, { useState } from 'react';
import { useApi } from '../../hooks/UseApi';
import { recomendacionesService } from '../../services/recomendacionesService';

const RecomendacionesPaciente = () => {
  const { data: recomendacionesData, loading, error, refetch } = useApi(() => 
    recomendacionesService.getRecomendaciones()
  );

  const { data: estadoIAData } = useApi(() => recomendacionesService.getEstadoIA());
  const { data: ejerciciosData } = useApi(() => recomendacionesService.getEjercicios());
  const { data: consejosData } = useApi(() => recomendacionesService.getConsejos());

  const [activeTab, setActiveTab] = useState('todas');
  const [generateLoading, setGenerateLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerarRecomendaciones = async () => {
    if (!window.confirm('¿Generar nuevas recomendaciones personalizadas? Esto reemplazará las recomendaciones actuales.')) {
      return;
    }

    setGenerateLoading(true);
    setMessage('');

    try {
      const response = await recomendacionesService.generarRecomendaciones();
      
      if (response.success) {
        setMessage('✅ Recomendaciones generadas exitosamente');
        refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error al generar recomendaciones: ' + error.response?.data?.message);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleCompletar = async (id) => {
    try {
      const response = await recomendacionesService.marcarCompletada(id);
      
      if (response.success) {
        setMessage('✅ Recomendación marcada como completada');
        refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error al completar recomendación: ' + error.response?.data?.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error al cargar recomendaciones: {error}
    </div>
  );

  const todasRecomendaciones = recomendacionesData?.data || [];
  const recomendacionesPendientes = todasRecomendaciones.filter(r => !r.completada);
  const recomendacionesCompletadas = todasRecomendaciones.filter(r => r.completada);

  const ejercicios = ejerciciosData?.data || [];
  const consejos = consejosData?.data || [];

  const categorias = {
    EJERCICIO: { label: 'Ejercicios', color: 'blue', icon: '💪' },
    NUTRICION: { label: 'Nutrición', color: 'green', icon: '🥗' },
    DESCANSO: { label: 'Descanso', color: 'purple', icon: '😴' },
    CONSEJO_DIARIO: { label: 'Consejos Diarios', color: 'orange', icon: '💡' },
    TERAPIA: { label: 'Terapia', color: 'red', icon: '🏥' }
  };

  const getRecomendacionesPorTab = () => {
    switch (activeTab) {
      case 'pendientes':
        return recomendacionesPendientes;
      case 'completadas':
        return recomendacionesCompletadas;
      case 'ejercicios':
        return ejercicios;
      case 'consejos':
        return consejos;
      default:
        return todasRecomendaciones;
    }
  };

  const recomendacionesAMostrar = getRecomendacionesPorTab();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mis Recomendaciones</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleGenerarRecomendaciones}
            disabled={generateLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {generateLoading ? 'Generando...' : '🔄 Generar Nuevas'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('❌') 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Estado de IA */}
      {estadoIAData?.data && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                estadoIAData.data.iaDisponible ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm font-medium">
                Sistema de IA: {estadoIAData.data.mensaje}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {estadoIAData.data.iaDisponible ? '✅ Conectado' : '⚠️ Usando reglas'}
            </span>
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">{todasRecomendaciones.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-orange-600">{recomendacionesPendientes.length}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{recomendacionesCompletadas.length}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-red-600">
            {recomendacionesPendientes.filter(r => r.prioridad === 'URGENTE').length}
          </div>
          <div className="text-sm text-gray-600">Urgentes</div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { id: 'todas', label: `Todas (${todasRecomendaciones.length})` },
              { id: 'pendientes', label: `Pendientes (${recomendacionesPendientes.length})` },
              { id: 'completadas', label: `Completadas (${recomendacionesCompletadas.length})` },
              { id: 'ejercicios', label: `Ejercicios (${ejercicios.length})` },
              { id: 'consejos', label: `Consejos (${consejos.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {recomendacionesAMostrar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recomendacionesAMostrar.map((recomendacion) => {
                const categoria = categorias[recomendacion.categoria] || 
                                { label: recomendacion.categoria, color: 'gray', icon: '📌' };
                
                return (
                  <div 
                    key={recomendacion.id} 
                    className={`border rounded-lg p-4 transition-all hover:shadow-lg ${
                      recomendacion.completada ? 'bg-gray-50 opacity-75' : 'bg-white'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{categoria.icon}</span>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {recomendacion.titulo}
                        </h3>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recomendacion.prioridad === 'URGENTE' ? 'bg-red-100 text-red-800' :
                          recomendacion.prioridad === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                          recomendacion.prioridad === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {recomendacion.prioridad}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${categoria.color}-100 text-${categoria.color}-800`}>
                          {categoria.label}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {recomendacion.descripcion}
                    </p>

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {recomendacion.fechaCreacion && 
                          new Date(recomendacion.fechaCreacion).toLocaleDateString()
                        }
                      </div>
                      
                      {!recomendacion.completada ? (
                        <button
                          onClick={() => handleCompletar(recomendacion.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          ✅ Completar
                        </button>
                      ) : (
                        <span className="text-green-600 text-sm font-medium flex items-center">
                          ✓ Completada
                        </span>
                      )}
                    </div>

                    {/* Indicador de IA */}
                    {recomendacion.categoria?.includes('_IA') && (
                      <div className="mt-2 text-xs text-blue-600 flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span>
                        Generado por IA
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'pendientes' ? '¡No hay recomendaciones pendientes!' :
                 activeTab === 'completadas' ? 'Aún no has completado recomendaciones' :
                 'No hay recomendaciones disponibles'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'todas' && 'Genera tus primeras recomendaciones personalizadas'}
                {activeTab === 'pendientes' && '¡Excelente trabajo! Has completado todas las recomendaciones.'}
                {activeTab === 'completadas' && 'Completa algunas recomendaciones para verlas aquí.'}
              </p>
              
              {activeTab === 'todas' && (
                <button
                  onClick={handleGenerarRecomendaciones}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                >
                  Generar Mis Primeras Recomendaciones
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Sobre tus recomendaciones
        </h3>
        <p className="text-blue-800 text-sm">
          Tus recomendaciones son generadas personalmente basadas en tu perfil médico, 
          síntomas registrados y etapa de Parkinson. Las recomendaciones marcadas como 
          <span className="font-semibold"> URGENTE</span> deben ser atendidas prioritariamente.
        </p>
      </div>
    </div>
  );
};

export default RecomendacionesPaciente;