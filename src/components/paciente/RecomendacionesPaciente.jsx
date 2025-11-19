import React, { useState} from 'react';
import { useApi } from '../../hooks/UseApi';
import { recomendacionesService } from '../../services/recomendacionesService';
import {  getColorPrioridad, getColorEstado, ESTADO_RECOMENDACION } from '../../services/sintomasService';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // ✅ NUEVO: Estado para manejar errores específicos
  const [errorDetails, setErrorDetails] = useState('');

  const handleGenerarRecomendaciones = async () => {
    if (!window.confirm('¿Generar nuevas recomendaciones personalizadas? Esto analizará tus síntomas recientes y generará recomendaciones personalizadas.')) {
      return;
    }

    setGenerateLoading(true);
    setMessage('');
    setErrorDetails('');

    try {
      const response = await recomendacionesService.generarRecomendaciones();
      
      if (response.success) {
        // ✅ NUEVO: Mostrar información detallada sobre recomendaciones generadas
        setSuccessData({
          total: response.data.recomendaciones?.length || 0,
          pendientesAprobacion: response.data.pendientesAprobacion || 0,
          activas: response.data.activas || 0,
          mensaje: response.data.mensajePaciente || 'Recomendaciones generadas exitosamente'
        });
        setShowSuccessModal(true);
        refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessage('❌ ' + errorMessage);
      
      // ✅ NUEVO: Mostrar detalles específicos del error
      if (errorMessage.includes('síntomas')) {
        setErrorDetails('Registra al menos un síntoma antes de generar recomendaciones.');
      } else if (errorMessage.includes('cambios significativos')) {
        setErrorDetails('Espera a tener cambios significativos en tus síntomas para generar nuevas recomendaciones.');
      }
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

  // ✅ NUEVO: Función para obtener recomendaciones filtradas por estado
  const getRecomendacionesFiltradas = () => {
    const todasRecomendaciones = recomendacionesData?.data?.recomendaciones || [];
    
    // ✅ SOLO mostrar recomendaciones ACTIVAS, APROBADAS o MODIFICADAS al paciente
    const recomendacionesActivas = todasRecomendaciones.filter(r => 
      r.estado === ESTADO_RECOMENDACION.ACTIVA || 
      r.estado === ESTADO_RECOMENDACION.APROBADA || 
      r.estado === ESTADO_RECOMENDACION.MODIFICADA
    );

    const recomendacionesPendientes = recomendacionesActivas.filter(r => !r.completada);
    const recomendacionesCompletadas = recomendacionesActivas.filter(r => r.completada);

    return {
      todas: recomendacionesActivas,
      pendientes: recomendacionesPendientes,
      completadas: recomendacionesCompletadas
    };
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

  const { todas, pendientes, completadas } = getRecomendacionesFiltradas();
  const ejercicios = ejerciciosData?.data || [];
  const consejos = consejosData?.data || [];

  // ✅ NUEVO: Contar recomendaciones pendientes de aprobación (para el mensaje)
  const recomendacionesPendientesAprobacion = recomendacionesData?.data?.mensaje ? 
    (recomendacionesData.data.mensaje.match(/\d+/)?.[0] || 0) : 0;

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
        return pendientes;
      case 'completadas':
        return completadas;
      case 'ejercicios':
        return ejercicios;
      case 'consejos':
        return consejos;
      default:
        return todas;
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {generateLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Generar Nuevas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ✅ NUEVO: Mensaje sobre recomendaciones pendientes de aprobación */}
      {recomendacionesPendientesAprobacion > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-lg">⏳</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Tienes {recomendacionesPendientesAprobacion} recomendaciones pendientes de aprobación médica
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Tu doctor está revisando las recomendaciones generadas. Te notificaremos cuando estén disponibles.
              </p>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('❌') 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              {message}
              {errorDetails && (
                <p className="text-sm mt-1 opacity-90">{errorDetails}</p>
              )}
            </div>
            {message.includes('❌') && (
              <button 
                onClick={() => setMessage('')}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </div>
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
          <div className="text-2xl font-bold text-blue-600">{todas.length}</div>
          <div className="text-sm text-gray-600">Disponibles</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-orange-600">{pendientes.length}</div>
          <div className="text-sm text-gray-600">Por Completar</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{completadas.length}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-red-600">
            {pendientes.filter(r => r.prioridad === 'URGENTE').length}
          </div>
          <div className="text-sm text-gray-600">Urgentes</div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { id: 'todas', label: `Disponibles (${todas.length})` },
              { id: 'pendientes', label: `Por Completar (${pendientes.length})` },
              { id: 'completadas', label: `Completadas (${completadas.length})` },
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorPrioridad(recomendacion.prioridad)}`}>
                          {recomendacion.prioridad}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorEstado(recomendacion.estado)}`}>
                          {recomendacion.estado === 'MODIFICADA' ? 'Ajustada por doctor' : 
                           recomendacion.estado === 'APROBADA' ? 'Aprobada' : 'Activa'}
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {recomendacion.descripcion}
                    </p>

                    {/* ✅ NUEVO: Comentarios del doctor si existen */}
                    {recomendacion.comentariosDoctor && (
                      <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">Nota del doctor:</span> {recomendacion.comentariosDoctor}
                        </p>
                      </div>
                    )}

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

                    {/* ✅ NUEVO: Indicadores de fuente */}
                    <div className="mt-2 flex justify-between items-center text-xs">
                      {recomendacion.fuente === 'IA_OPENAI' && (
                        <span className="text-blue-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span>
                          Generado por IA
                        </span>
                      )}
                      {recomendacion.fuente === 'SISTEMA' && (
                        <span className="text-gray-500 flex items-center">
                          <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                          Recomendación del sistema
                        </span>
                      )}
                    </div>
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

      {/* ✅ NUEVO: Modal de éxito */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Recomendaciones Generadas
              </h3>
              <p className="text-gray-600 mb-4">
                {successData.mensaje}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{successData.total}</div>
                  <div className="text-sm text-blue-800">Total generadas</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{successData.pendientesAprobacion}</div>
                  <div className="text-sm text-yellow-800">En revisión médica</div>
                </div>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Sobre tus recomendaciones
        </h3>
        <p className="text-blue-800 text-sm mb-2">
          • <strong>Recomendaciones del sistema:</strong> Siempre disponibles y aprobadas automáticamente
        </p>
        <p className="text-blue-800 text-sm mb-2">
          • <strong>Recomendaciones de IA:</strong> Son revisadas por tu doctor antes de estar disponibles
        </p>
        <p className="text-blue-800 text-sm">
          • Las recomendaciones marcadas como <span className="font-semibold">URGENTE</span> deben ser atendidas prioritariamente
        </p>
      </div>
    </div>
  );
};

export default RecomendacionesPaciente;