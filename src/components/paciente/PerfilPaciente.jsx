import React, { useState } from 'react';
import { useApi } from '../../hooks/UseApi';
import { pacienteService } from '../../services/pacienteService';

const PerfilPaciente = () => {
  const { data: perfilData, loading, error, refetch } = useApi(() => 
    pacienteService.getPerfil()
  );
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inicializar formData cuando se cargan los datos
  React.useEffect(() => {
    if (perfilData?.data) {
      setFormData({
        telefono: perfilData.telefono || '',
        direccion: perfilData.direccion || '',
        genero: perfilData.genero || ''
      });
    }
  }, [perfilData]);
  console.log(perfilData)

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage('');

    try {
      const response = await pacienteService.updatePerfil(formData);
      
      if (response.success) {
        setMessage('Perfil actualizado exitosamente');
        setEditMode(false);
        refetch(); // Recargar datos
      } else {
        setMessage('Error: ' + response.message);
      }
    } catch (error) {
      setMessage('Error al actualizar perfil: ' + error.response?.data?.message);
    } finally {
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

  const paciente = perfilData?.data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
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
          message.includes('Error') 
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                      <p className="mt-1 text-sm text-gray-900">{paciente?.nombre}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{paciente?.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Usuario</label>
                      <p className="mt-1 text-sm text-gray-900">{paciente?.username}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {paciente?.telefono || 'No especificado'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {paciente?.direccion || 'No especificada'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Género</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {paciente?.genero || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Médica</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Etapa de Parkinson</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {paciente?.etapaParkinson || 'No especificada'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Diagnóstico</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {paciente?.fechaDiagnostico 
                          ? new Date(paciente.fechaDiagnostico).toLocaleDateString() 
                          : 'No especificada'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // MODO EDICIÓN
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
                
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa tu teléfono"
                  />
                </div>

                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion || ''}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ingresa tu dirección"
                  />
                </div>

                <div>
                  <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                    Género
                  </label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar género</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                    <option value="PREFIERO_NO_DECIR">Prefiero no decir</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información de Solo Lectura</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                  <p className="mt-1 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">
                    {paciente?.nombre}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">No editable</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">
                    {paciente?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">No editable</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="mt-1 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">
                    {paciente?.username}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">No editable</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updateLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PerfilPaciente;