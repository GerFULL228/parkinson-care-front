import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/UseApi';
import { doctorService } from '../../services/doctorService';
import { citasService } from '../../services/citaService';
import { recomendacionesService } from '../../services/recomendacionesService';

const DetallePaciente = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('general');

  const { data: pacienteData, loading, error } = useApi(() => 
    doctorService.getDetallePaciente(id)
  );

  const { data: citasData } = useApi(() => citasService.getCitasDoctor());
  const { data: recomendacionesData } = useApi(() => recomendacionesService.getRecomendaciones());

  const [message, setMessage] = useState('');

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

  // Filtrar citas de este paciente
  const citasPaciente = citasData?.data?.filter(cita => cita.paciente?.id == id) || [];
  const recomendacionesPaciente = recomendacionesData?.data?.filter(rec => rec.paciente?.id == id) || [];

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

  const handleCrearRecomendacion = async () => {
    try {
      const response = await recomendacionesService.generarRecomendaciones();
      if (response.success) {
        setMessage('✅ Recomendaciones generadas exitosamente');
        // Recargar datos
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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
              { id: 'recomendaciones', label: `Recomendaciones (${recomendacionesPaciente.length})` },
              { id: 'sintomas', label: 'Síntomas' },
              { id: 'historial', label: 'Historial Médico' }
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
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.username}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.telefono || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Edad</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.edad ? `${paciente.edad} años` : 'No especificada'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Género</label>
                        <p className="mt-1 text-sm text-gray-900">{paciente.genero || 'No especificado'}</p>
                      </div>
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
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-6">
                {/* Medicamentos */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Medicamentos Actuales</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">
                      {paciente.medicamentosActuales || 'No se han especificado medicamentos'}
                    </p>
                  </div>
                </div>

                {/* Comorbilidades */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Comorbilidades</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">
                      {paciente.comorbilidades || 'No se han especificado comorbilidades'}
                    </p>
                  </div>
                </div>

                {/* Resumen de Actividad */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Resumen de Actividad</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{citasPaciente.length}</div>
                      <div className="text-xs text-blue-600">Citas Totales</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">{recomendacionesPaciente.length}</div>
                      <div className="text-xs text-green-600">Recomendaciones</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Historial de Citas</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  + Programar Cita
                </button>
              </div>

              {citasPaciente.length > 0 ? (
                <div className="space-y-4">
                  {citasPaciente.map((cita) => (
                    <div key={cita.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Cita del {new Date(cita.fechaHora).toLocaleDateString()}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cita.estado === 'PROGRAMADA' ? 'bg-green-100 text-green-800' :
                              cita.estado === 'COMPLETADA' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cita.estado}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Hora:</span>{' '}
                              {new Date(cita.fechaHora).toLocaleTimeString()}
                            </div>
                            <div>
                              <span className="font-medium">Motivo:</span> {cita.motivo}
                            </div>
                          </div>

                          {cita.notas && (
                            <div className="mt-2">
                              <span className="font-medium text-sm text-gray-700">Notas:</span>
                              <p className="text-sm text-gray-600 mt-1">{cita.notas}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {cita.estado === 'PROGRAMADA' && (
                            <>
                              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                Confirmar
                              </button>
                              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
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

          {activeTab === 'recomendaciones' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recomendaciones del Paciente</h2>
                <button
                  onClick={handleCrearRecomendacion}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Generar Recomendaciones
                </button>
              </div>

              {recomendacionesPaciente.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recomendacionesPaciente.map((recomendacion) => (
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
                      
                      <p className="text-gray-600 mb-4 text-sm">{recomendacion.descripcion}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {recomendacion.categoria}
                        </span>
                        
                        <span className={`text-sm font-medium ${
                          recomendacion.completada ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {recomendacion.completada ? '✓ Completada' : '⏳ Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">💡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recomendaciones</h3>
                  <p className="text-gray-500 mb-4">Genera recomendaciones personalizadas para este paciente</p>
                  <button
                    onClick={handleCrearRecomendacion}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Generar Primeras Recomendaciones
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sintomas' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Registro de Síntomas</h2>
              
              {paciente.sintomasRecientes && paciente.sintomasRecientes.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {paciente.sintomasRecientes.length}
                      </div>
                      <div className="text-sm text-gray-600">Registros totales</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(paciente.sintomasRecientes.reduce((acc, s) => acc + s.nivelTemblor, 0) / paciente.sintomasRecientes.length)}
                      </div>
                      <div className="text-sm text-gray-600">Temblor promedio</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(paciente.sintomasRecientes.reduce((acc, s) => acc + s.nivelRigidez, 0) / paciente.sintomasRecientes.length)}
                      </div>
                      <div className="text-sm text-gray-600">Rigidez promedio</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(paciente.sintomasRecientes.reduce((acc, s) => acc + s.nivelBradicinesia, 0) / paciente.sintomasRecientes.length)}
                      </div>
                      <div className="text-sm text-gray-600">Bradicinesia promedio</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {paciente.sintomasRecientes.slice(0, 10).map((sintoma) => (
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
                            <div className="font-semibold text-blue-600">{sintoma.nivelTemblor}/10</div>
                            <div className="text-xs text-gray-500">Temblor</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{sintoma.nivelRigidez}/10</div>
                            <div className="text-xs text-gray-500">Rigidez</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">{sintoma.nivelBradicinesia}/10</div>
                            <div className="text-xs text-gray-500">Bradicinesia</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{sintoma.nivelEquilibrio}/10</div>
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

          {activeTab === 'historial' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Historial Médico Completo</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-yellow-600 text-4xl mb-3">🚧</div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Funcionalidad en desarrollo</h3>
                <p className="text-yellow-700">
                  El historial médico completo estará disponible en la próxima actualización.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetallePaciente;