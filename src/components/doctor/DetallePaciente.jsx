import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/UseApi';
import { doctorService } from '../../services/doctorService';
import { citasService } from '../../services/citaService';
import { recomendacionesService } from '../../services/recomendacionesService';
import { sintomasService } from '../../services/sintomasService';

const DetallePaciente = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState('');
  const [modifyingId, setModifyingId] = useState(null);
  const [modifications, setModifications] = useState({});
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [recomendacionAprobar, setRecomendacionAprobar] = useState(null);

  // ✅ Datos del paciente
  const { data: pacienteData, loading, error,  } = useApi(() => 
    doctorService.getDetallePaciente(id)
  );

  // ✅ Citas del paciente
  const { data: citasPacienteData, refetch: refetchCitas } = useApi(() => 
    doctorService.getCitasPaciente(id)
  );

  // ✅ Síntomas del paciente
  const { data: sintomasData,  } = useApi(() => 
    sintomasService.getHistorialPaciente(id)
  );

  // ✅ CORREGIDO: Recomendaciones del paciente
  const { data: recomendacionesData, refetch: refetchRecomendaciones } = useApi(() => 
    recomendacionesService.getRecomendacionesPaciente?.(id) || 
    Promise.resolve({ data: [] })
  );

  // ✅ Recomendaciones pendientes de aprobación
  const { data: pendientesData, refetch: refetchPendientes } = useApi(() => 
    doctorService.getRecomendacionesPendientes()
  );

  // ✅ DEBUG
  console.log('🔍 Recomendaciones data:', recomendacionesData);
  console.log('🔍 Pendientes data:', pendientesData);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error al cargar paciente: {error}
    </div>
  );

  const paciente = pacienteData?.data;
  if (!paciente) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Paciente no encontrado
    </div>
  );

  // ✅ CORREGIDO: Procesar datos basado en la estructura real
  const citasPaciente = citasPacienteData?.data?.citas || [];
  const sintomasPaciente = sintomasData?.data || [];
  
  // ✅ CLAVE: Acceso correcto a las recomendaciones
  const todasRecomendaciones = recomendacionesData?.data?.recomendaciones || [];
  
  // ✅ CORREGIDO: Filtrar recomendaciones pendientes para este paciente
  const todasPendientes = pendientesData?.data || [];
  const recomendacionesPendientesDoctor = todasPendientes.filter(rec => 
    rec.paciente?.id == id || rec.pacienteId == id
  );

  const estadisticasCitas = citasPacienteData?.data?.estadisticas || {};
  const proximaCita = citasPacienteData?.data?.proximaCita;
  const ultimaCita = citasPacienteData?.data?.ultimaCita;

  // ✅ Funciones de ayuda para estilos
  const getEtapaColor = (etapa) => {
    switch (etapa) {
      case 'ETAPA_1': return 'bg-green-100 text-green-800 border-green-200';
      case 'ETAPA_2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ETAPA_3': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ETAPA_4': return 'bg-red-100 text-red-800 border-red-200';
      case 'ETAPA_5': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PROGRAMADA': return 'bg-green-100 text-green-800';
      case 'CONFIRMADA': return 'bg-blue-100 text-blue-800';
      case 'COMPLETADA': return 'bg-gray-100 text-gray-800';
      case 'CANCELADA': return 'bg-red-100 text-red-800';
      case 'REPROGRAMADA': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'URGENTE': return 'bg-red-100 text-red-800';
      case 'ALTA': return 'bg-orange-100 text-orange-800';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
      case 'BAJA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoRecomendacionColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE_APROBACION': return 'bg-yellow-100 text-yellow-800';
      case 'APROBADA': return 'bg-green-100 text-green-800';
      case 'MODIFICADA': return 'bg-blue-100 text-blue-800';
      case 'RECHAZADA': return 'bg-red-100 text-red-800';
      case 'ACTIVA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Funciones de gestión (mantener igual)
  const handleActualizarEstadoCita = async (citaId, nuevoEstado) => {
    try {
      const response = await citasService.actualizarEstado(citaId, nuevoEstado);
      if (response.success) {
        setMessage(`✅ Cita ${nuevoEstado.toLowerCase()} exitosamente`);
        refetchCitas();
      }
    } catch (error) {
      setMessage('❌ Error al actualizar cita: ' + error.response?.data?.message);
    }
  };

  const handleAprobarRecomendacion = async (recomendacionId, comentarios = '') => {
    try {
      const response = await doctorService.aprobarRecomendacion(recomendacionId, comentarios);
      if (response.success) {
        setMessage('✅ Recomendación aprobada y enviada al paciente');
        setShowAprobarModal(false);
        setRecomendacionAprobar(null);
        refetchRecomendaciones();
        refetchPendientes();
      }
    } catch (error) {
      setMessage('❌ Error al aprobar recomendación: ' + error.response?.data?.message);
    }
  };

  const handleModificarRecomendacion = async (recomendacionId) => {
    try {
      const response = await doctorService.modificarRecomendacion(
        recomendacionId, 
        modifications
      );
      if (response.success) {
        setMessage('✅ Recomendación modificada y enviada al paciente');
        setModifyingId(null);
        setModifications({});
        refetchRecomendaciones();
        refetchPendientes();
      }
    } catch (error) {
      setMessage('❌ Error al modificar recomendación: ' + error.response?.data?.message);
    }
  };

  const handleRechazarRecomendacion = async (recomendacionId) => {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (motivo) {
      try {
        const response = await doctorService.rechazarRecomendacion(recomendacionId, motivo);
        if (response.success) {
          setMessage('✅ Recomendación rechazada');
          refetchRecomendaciones();
          refetchPendientes();
        }
      } catch (error) {
        setMessage('❌ Error al rechazar recomendación: ' + error.response?.data?.message);
      }
    }
  };

  const iniciarModificacion = (recomendacion) => {
    setModifyingId(recomendacion.id);
    setModifications({
      nuevoTitulo: recomendacion.titulo,
      nuevaDescripcion: recomendacion.descripcion,
      comentarios: ''
    });
  };

  const cancelarModificacion = () => {
    setModifyingId(null);
    setModifications({});
  };

  const iniciarAprobacion = (recomendacion) => {
    setRecomendacionAprobar(recomendacion);
    setShowAprobarModal(true);
  };

  const handleGenerarRecomendaciones = async () => {
    try {
      setMessage('🔄 Generando recomendaciones...');
      const response = await recomendacionesService.generarRecomendaciones();
      if (response.success) {
        setMessage('✅ Recomendaciones generadas exitosamente');
        refetchRecomendaciones();
        refetchPendientes();
      }
    } catch (error) {
      setMessage('❌ Error al generar recomendaciones: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{paciente.nombre}</h1>
            {paciente.etapaParkinson && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEtapaColor(paciente.etapaParkinson)}`}>
                {paciente.etapaParkinson.replace('_', ' ')}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">{paciente.email} • {paciente.telefono || 'Sin teléfono'}</p>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to="/doctor/pacientes"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            ← Volver
          </Link>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Nueva Cita
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

      {/* Tabs de navegación */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { id: 'general', label: 'Información General' },
              { id: 'citas', label: `Citas (${citasPaciente.length})` },
              { id: 'recomendaciones', label: `Recomendaciones (${todasRecomendaciones.length})` },
              { id: 'pendientes', label: `Pendientes (${recomendacionesPendientesDoctor.length})` },
              { id: 'sintomas', label: `Síntomas (${sintomasPaciente.length})` }
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
          {/* Pestaña General */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información Personal */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.nombre}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.telefono || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Edad</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.edad ? `${paciente.edad} años` : 'No especificada'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Género</label>
                      <p className="mt-1 text-sm text-gray-900">{paciente.genero || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Información Médica */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Información Médica</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Etapa de Parkinson</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {paciente.etapaParkinson ? paciente.etapaParkinson.replace('_', ' ') : 'No especificada'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Diagnóstico</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {paciente.fechaDiagnostico 
                            ? new Date(paciente.fechaDiagnostico).toLocaleDateString() 
                            : 'No especificada'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medicamentos Actuales</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {paciente.medicamentosActuales || 'No se han especificado medicamentos'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-6">
                {/* Resumen */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Resumen</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{estadisticasCitas.totalCitas || 0}</div>
                      <div className="text-xs text-blue-600">Citas Totales</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">{estadisticasCitas.citasProgramadas || 0}</div>
                      <div className="text-xs text-green-600">Programadas</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-600">{estadisticasCitas.citasCompletadas || 0}</div>
                      <div className="text-xs text-gray-600">Completadas</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">{todasRecomendaciones.length}</div>
                      <div className="text-xs text-purple-600">Recomendaciones</div>
                    </div>
                  </div>
                </div>

                {/* Próxima Cita */}
                {proximaCita && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">📅 Próxima Cita</h3>
                    <p className="text-green-700">
                      <strong>Fecha:</strong> {new Date(proximaCita.fechaHora).toLocaleString()}
                    </p>
                    <p className="text-green-700">
                      <strong>Motivo:</strong> {proximaCita.motivo}
                    </p>
                    <p className="text-green-700">
                      <strong>Estado:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${getEstadoColor(proximaCita.estado)}`}>
                        {proximaCita.estado}
                      </span>
                    </p>
                  </div>
                )}

                {/* Última Cita */}
                {ultimaCita && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">🕐 Última Cita</h3>
                    <p className="text-blue-700">
                      <strong>Fecha:</strong> {new Date(ultimaCita.fechaHora).toLocaleString()}
                    </p>
                    <p className="text-blue-700">
                      <strong>Motivo:</strong> {ultimaCita.motivo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pestaña Citas */}
          {activeTab === 'citas' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Historial de Citas</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  + Programar Cita
                </button>
              </div>

              {/* Estadísticas de Citas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-blue-600">{estadisticasCitas.totalCitas || 0}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-green-600">{estadisticasCitas.citasProgramadas || 0}</div>
                  <div className="text-sm text-gray-600">Programadas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-gray-600">{estadisticasCitas.citasCompletadas || 0}</div>
                  <div className="text-sm text-gray-600">Completadas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <div className="text-2xl font-bold text-red-600">{estadisticasCitas.citasCanceladas || 0}</div>
                  <div className="text-sm text-gray-600">Canceladas</div>
                </div>
              </div>

              {citasPaciente.length > 0 ? (
                <div className="space-y-4">
                  {citasPaciente.map((cita) => (
                    <div key={cita.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Cita del {new Date(cita.fechaHora).toLocaleDateString()}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                              {cita.estado}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Hora:</span>{' '}
                              {new Date(cita.fechaHora).toLocaleTimeString()}
                            </div>
                            <div>
                              <span className="font-medium">Motivo:</span> {cita.motivo}
                            </div>
                            <div>
                              <span className="font-medium">Creada:</span>{' '}
                              {new Date(cita.fechaCreacion).toLocaleDateString()}
                            </div>
                          </div>

                          {cita.notas && (
                            <div className="mt-2">
                              <span className="font-medium text-sm text-gray-700">Notas:</span>
                              <p className="text-sm text-gray-600 mt-1">{cita.notas}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          {(cita.estado === 'PROGRAMADA' || cita.estado === 'CONFIRMADA') && (
                            <>
                              {cita.estado === 'PROGRAMADA' && (
                                <button 
                                  onClick={() => handleActualizarEstadoCita(cita.id, 'CONFIRMADA')}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 whitespace-nowrap"
                                >
                                  Confirmar
                                </button>
                              )}
                              <button 
                                onClick={() => handleActualizarEstadoCita(cita.id, 'COMPLETADA')}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                              >
                                Completar
                              </button>
                              <button 
                                onClick={() => handleActualizarEstadoCita(cita.id, 'CANCELADA')}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 whitespace-nowrap"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas registradas</h3>
                  <p className="text-gray-500">Programa la primera cita con este paciente</p>
                </div>
              )}
            </div>
          )}

          {/* Pestaña Recomendaciones */}
          {activeTab === 'recomendaciones' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recomendaciones del Paciente</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleGenerarRecomendaciones}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Generar Recomendaciones
                  </button>
                </div>
              </div>

              {todasRecomendaciones.length > 0 ? (
                <div className="space-y-4">
                  {todasRecomendaciones.map((recomendacion) => (
                    <div key={recomendacion.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {recomendacion.titulo}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(recomendacion.prioridad)}`}>
                              {recomendacion.prioridad}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoRecomendacionColor(recomendacion.estado)}`}>
                              {recomendacion.estado === 'MODIFICADA' ? 'Ajustada por doctor' : 
                               recomendacion.estado === 'APROBADA' ? 'Oficial' : 
                               recomendacion.estado === 'ACTIVA' ? 'Activa' : recomendacion.estado}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{recomendacion.descripcion}</p>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Categoría: {recomendacion.categoria}</span>
                            {recomendacion.fuente === 'IA_OPENAI' && (
                              <span className="text-blue-600">• Generada por IA</span>
                            )}
                            {recomendacion.fuente === 'SISTEMA' && (
                              <span className="text-gray-600">• Recomendación del sistema</span>
                            )}
                            {recomendacion.completada && (
                              <span className="text-green-600">• Completada por el paciente</span>
                            )}
                          </div>

                          {recomendacion.comentariosDoctor && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-blue-800">
                                <span className="font-semibold">Nota del doctor:</span> {recomendacion.comentariosDoctor}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">💡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recomendaciones</h3>
                  <p className="text-gray-500">Este paciente aún no tiene recomendaciones activas</p>
                </div>
              )}
            </div>
          )}

          {/* Pestaña Pendientes */}
          {activeTab === 'pendientes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recomendaciones Pendientes de Aprobación</h2>
                <div className="text-sm text-gray-500">
                  {recomendacionesPendientesDoctor.length} por revisar
                </div>
              </div>

              {recomendacionesPendientesDoctor.length > 0 ? (
                <div className="space-y-6">
                  {recomendacionesPendientesDoctor.map((recomendacion) => (
                    <div key={recomendacion.id} className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          {modifyingId === recomendacion.id ? (
                            // Formulario de modificación
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={modifications.nuevoTitulo || ''}
                                onChange={(e) => setModifications({...modifications, nuevoTitulo: e.target.value})}
                                className="w-full p-2 border rounded-md"
                                placeholder="Título de la recomendación"
                              />
                              <textarea
                                value={modifications.nuevaDescripcion || ''}
                                onChange={(e) => setModifications({...modifications, nuevaDescripcion: e.target.value})}
                                className="w-full p-2 border rounded-md"
                                rows="3"
                                placeholder="Descripción detallada"
                              />
                              <input
                                type="text"
                                value={modifications.comentarios || ''}
                                onChange={(e) => setModifications({...modifications, comentarios: e.target.value})}
                                className="w-full p-2 border rounded-md"
                                placeholder="Comentarios para el paciente (opcional)"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleModificarRecomendacion(recomendacion.id)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                                >
                                  ✅ Guardar Cambios
                                </button>
                                <button
                                  onClick={cancelarModificacion}
                                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Vista normal de la recomendación
                            <>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {recomendacion.titulo}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(recomendacion.prioridad)}`}>
                                  {recomendacion.prioridad}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3">{recomendacion.descripcion}</p>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Categoría: {recomendacion.categoria}</span>
                                <span className="text-blue-600">• Generada por IA</span>
                                <span>• Creada: {new Date(recomendacion.fechaCreacion).toLocaleDateString()}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {modifyingId !== recomendacion.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => iniciarAprobacion(recomendacion)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                          >
                            ✅ Aprobar y Enviar
                          </button>
                          <button
                            onClick={() => iniciarModificacion(recomendacion)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                          >
                            ✏️ Modificar
                          </button>
                          <button
                            onClick={() => handleRechazarRecomendacion(recomendacion.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">🎉</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recomendaciones pendientes</h3>
                  <p className="text-gray-500">Todas las recomendaciones han sido revisadas</p>
                </div>
              )}
            </div>
          )}

          {/* Pestaña Síntomas */}
          {activeTab === 'sintomas' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Registro de Síntomas</h2>
              
              {sintomasPaciente.length > 0 ? (
                <div className="space-y-4">
                  {/* Estadísticas de Síntomas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {sintomasPaciente.length}
                      </div>
                      <div className="text-sm text-gray-600">Registros totales</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(sintomasPaciente.reduce((acc, s) => acc + (s.nivelTemblor || 0), 0) / sintomasPaciente.length) || 0}
                      </div>
                      <div className="text-sm text-gray-600">Temblor promedio</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(sintomasPaciente.reduce((acc, s) => acc + (s.nivelRigidez || 0), 0) / sintomasPaciente.length) || 0}
                      </div>
                      <div className="text-sm text-gray-600">Rigidez promedio</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(sintomasPaciente.reduce((acc, s) => acc + (s.nivelBradicinesia || 0), 0) / sintomasPaciente.length) || 0}
                      </div>
                      <div className="text-sm text-gray-600">Bradicinesia promedio</div>
                    </div>
                  </div>

                  {/* Lista de Síntomas */}
                  <div className="space-y-3">
                    {sintomasPaciente.slice(0, 10).map((sintoma) => (
                      <div key={sintoma.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-white rounded-r-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(sintoma.fechaRegistro).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{sintoma.nivelTemblor || 0}/10</div>
                            <div className="text-xs text-gray-500">Temblor</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{sintoma.nivelRigidez || 0}/10</div>
                            <div className="text-xs text-gray-500">Rigidez</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">{sintoma.nivelBradicinesia || 0}/10</div>
                            <div className="text-xs text-gray-500">Bradicinesia</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{sintoma.nivelEquilibrio || 0}/10</div>
                            <div className="text-xs text-gray-500">Equilibrio</div>
                          </div>
                        </div>
                        {sintoma.notas && (
                          <p className="text-xs text-gray-600 mt-2">📝 {sintoma.notas}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros de síntomas</h3>
                  <p className="text-gray-500">El paciente aún no ha registrado síntomas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de aprobación */}
      {showAprobarModal && recomendacionAprobar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Aprobar Recomendación</h3>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">{recomendacionAprobar.titulo}</h4>
              <p className="text-sm text-gray-600 mt-1">{recomendacionAprobar.descripcion}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios para el paciente (opcional):
              </label>
              <textarea
                id="comentariosAprobacion"
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Ej: Esta es una excelente recomendación para tu etapa actual..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleAprobarRecomendacion(
                  recomendacionAprobar.id, 
                  document.getElementById('comentariosAprobacion')?.value || ''
                )}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                ✅ Aprobar y Enviar
              </button>
              <button
                onClick={() => {
                  setShowAprobarModal(false);
                  setRecomendacionAprobar(null);
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePaciente;