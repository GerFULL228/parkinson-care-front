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
  console.log(perfilData);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage('');

    try {
      // En una implementación real, aquí llamarías al servicio de actualización
      // const response = await doctorService.updatePerfil(formData);
      
      // Simulamos una actualización exitosa
      setTimeout(() => {
        setMessage('✅ Perfil actualizado exitosamente');
        setEditMode(false);
        setUpdateLoading(false);
        // En una implementación real: refetch();
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
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error al cargar perfil: {error}
    </div>
  );

  const doctor = perfilData;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil - Doctor</h1>
        <button
          onClick={handleEditToggle}
          className={`px-4 py-2 rounded-md ${
            editMode 
              ? 'bg-gray-500 text-white hover:bg-gray-600' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {editMode ? 'Cancelar' : 'Editar Perfil'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('❌') 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!editMode ? (
          // MODO VISUALIZACIÓN
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.nombre}</p>
                      
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Usuario</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.username}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.especialidad || 'No especificada'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Número de Colegiado</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.numeroLicencia || 'No especificado'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Años de Experiencia</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.experiencia || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Consultorio</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección del Consultorio</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.direccionConsultorio || 'No especificada'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Horario de Atención</label>
                      <p className="mt-1 text-sm text-gray-900">{doctor?.horarioAtencion || 'No especificado'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tarifa de Consulta</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {doctor?.tarifaConsulta ? `$${doctor.tarifaConsulta}` : 'No especificada'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Pacientes Atendidos</span>
                      <span className="text-sm text-gray-900">{doctor?.pacientesAtendidos || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Calificación</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{doctor?.calificacion || 'N/A'}</span>
                        {doctor?.calificacion && (
                          <div className="flex text-yellow-400">
                            {'★'.repeat(Math.round(doctor.calificacion))}
                            {'☆'.repeat(5 - Math.round(doctor.calificacion))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Estado</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doctor?.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor?.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // MODO EDICIÓN
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ingrese su teléfono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        id="especialidad"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ingrese su especialidad"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Consultorio</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="direccionConsultorio" className="block text-sm font-medium text-gray-700">
                        Dirección del Consultorio
                      </label>
                      <textarea
                        id="direccionConsultorio"
                        name="direccionConsultorio"
                        value={formData.direccionConsultorio}
                        onChange={handleChange}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ingrese la dirección de su consultorio"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="horarioAtencion" className="block text-sm font-medium text-gray-700">
                        Horario de Atención
                      </label>
                      <input
                        type="text"
                        id="horarioAtencion"
                        name="horarioAtencion"
                        value={formData.horarioAtencion}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  'Guardar Cambios'
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