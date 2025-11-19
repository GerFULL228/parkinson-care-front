import React, { useState } from 'react';
import { useApi } from '../../hooks/UseApi';
import { doctorService } from '../../services/doctorService';

const PerfilDoctor = () => {
  const { data: perfilData, loading, error } = useApi(() => 
    doctorService.getPerfil()
  );

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializar formData cuando se cargan los datos
  React.useEffect(() => {
    if (perfilData) {
      setFormData({
        telefono: perfilData.telefono || '',
        direccionConsultorio: perfilData.direccionConsultorio || '',
        horarioAtencion: perfilData.horarioAtencion || '',
        especialidad: perfilData.especialidad || '',
      });
    }
  }, [perfilData]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage('');

    try {
      // Simulamos una actualización exitosa
      setTimeout(() => {
        setMessage('✅ Perfil actualizado exitosamente');
        setEditMode(false);
        setUpdateLoading(false);
      }, 1000);
    } catch (error) {
      setMessage('❌ Error al actualizar perfil: ' + error.response?.data?.message);
      setUpdateLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-red-800">Error al cargar perfil</h3>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  );

  const doctor = perfilData?.data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información profesional y personal</p>
        </div>
        <button
          onClick={handleEditToggle}
          className={`inline-flex items-center px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            editMode 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {editMode ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Perfil
            </>
          )}
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-8 p-4 rounded-xl border ${
          message.includes('❌') 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {message.includes('❌') ? (
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!editMode ? (
          // MODO VISUALIZACIÓN
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Columna Izquierda */}
              <div className="space-y-8">
                {/* Información Personal */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-semibold text-gray-900">Información Personal</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Nombre completo</span>
                      <span className="text-sm text-gray-900 text-right font-medium">{doctor?.nombre}</span>
                    </div>
                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Email</span>
                      <span className="text-sm text-gray-900 text-right">{doctor?.email}</span>
                    </div>
                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Usuario</span>
                      <span className="text-sm text-gray-900 text-right">{doctor?.username}</span>
                    </div>
                    <div className="flex justify-between items-start py-3">
                      <span className="text-sm font-medium text-gray-600">Teléfono</span>
                      <span className="text-sm text-gray-900 text-right">{doctor?.telefono || 'No especificado'}</span>
                    </div>
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-green-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-semibold text-gray-900">Información Profesional</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Especialidad</span>
                      <span className="text-sm text-gray-900 text-right">{doctor?.especialidad || 'No especificada'}</span>
                    </div>
                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Número de Colegiado</span>
                      <span className="text-sm text-gray-900 text-right">{doctor?.numeroLicencia || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between items-start py-3">
                      <span className="text-sm font-medium text-gray-600">Años de Experiencia</span>
                      <span className="text-sm text-gray-900 text-right">{doctor?.experiencia || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-8">
                {/* Información del Consultorio */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-purple-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-semibold text-gray-900">Información del Consultorio</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600 block mb-2">Dirección del Consultorio</span>
                      <p className="text-sm text-gray-900">{doctor?.direccionConsultorio || 'No especificada'}</p>
                    </div>
                    <div className="flex justify-between items-start py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Horario de Atención</span>
                      <span className="text-sm text-gray-900 text-right">{doctor?.horarioAtencion || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between items-start py-3">
                      <span className="text-sm font-medium text-gray-600">Tarifa de Consulta</span>
                      <span className="text-sm text-gray-900 text-right font-medium">
                        {doctor?.tarifaConsulta ? `$${doctor.tarifaConsulta}` : 'No especificada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-orange-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-semibold text-gray-900">Estadísticas</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Pacientes Atendidos</span>
                      <span className="text-sm text-gray-900 font-semibold">{doctor?.pacientesAtendidos || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Calificación</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 font-semibold mr-3">{doctor?.calificacion || 'N/A'}</span>
                        {doctor?.calificacion && (
                          <div className="flex text-yellow-400">
                            {'★'.repeat(Math.round(doctor.calificacion))}
                            {'☆'.repeat(5 - Math.round(doctor.calificacion))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-gray-600">Estado</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Activo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // MODO EDICIÓN
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Columna Izquierda - Edición */}
              <div className="space-y-8">
                {/* Información de Contacto */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-blue-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-semibold text-gray-900">Información de Contacto</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Ingrese su teléfono"
                      />
                    </div>
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-green-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-semibold text-gray-900">Información Profesional</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-2">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        id="especialidad"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                        placeholder="Ingrese su especialidad"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha - Edición */}
              <div className="space-y-8">
                {/* Información del Consultorio */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-6 bg-purple-600 rounded-full mr-3"></div>
                    <h3 className="text-xl font-semibold text-gray-900">Información del Consultorio</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="direccionConsultorio" className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección del Consultorio
                      </label>
                      <textarea
                        id="direccionConsultorio"
                        name="direccionConsultorio"
                        value={formData.direccionConsultorio}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
                        placeholder="Ingrese la dirección de su consultorio"
                      />
                    </div>
                    <div>
                      <label htmlFor="horarioAtencion" className="block text-sm font-medium text-gray-700 mb-2">
                        Horario de Atención
                      </label>
                      <input
                        type="text"
                        id="horarioAtencion"
                        name="horarioAtencion"
                        value={formData.horarioAtencion}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                        placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PerfilDoctor;