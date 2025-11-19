import React, { useState } from 'react';
import { useApi } from '../../hooks/UseApi';
import { doctorService } from '../../services/doctorService';
import { Link } from 'react-router-dom';

const ListaPacientes = () => {
  const { data: responseData, loading, error } = useApi(() => 
    doctorService.getPacientes()
  );
   const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('');


  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error al cargar pacientes: {error}
    </div>
  );
  console.log('=== DEBUG LISTA PACIENTES ===');
  console.log('Response completa:', responseData);
  console.log('Tipo de responseData:', typeof responseData);
  console.log('Es array?', Array.isArray(responseData));
  console.log('Tiene propiedad data?', responseData && 'data' in responseData);
  console.log('Tiene propiedad success?', responseData && 'success' in responseData);

  const pacientes = responseData || [];

  console.log('Pacientes extraídos:', pacientes);
  console.log('Número de pacientes:', pacientes.length);



  // Filtrar pacientes
  const filteredPacientes = pacientes.filter(paciente => {
    const matchesSearch = paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paciente.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEtapa = !filterEtapa || paciente.etapaParkinson === filterEtapa;
    return matchesSearch && matchesEtapa;
  });

  // Estadísticas
  const estadisticas = {
    total: pacientes.length,
    etapa1: pacientes.filter(p => p.etapaParkinson === 'ETAPA_1').length,
    etapa2: pacientes.filter(p => p.etapaParkinson === 'ETAPA_2').length,
    etapa3: pacientes.filter(p => p.etapaParkinson === 'ETAPA_3').length,
    conRecomendaciones: pacientes.filter(p => p.recomendacionesPendientes > 0).length
  };

  const getEtapaColor = (etapa) => {
    switch (etapa) {
      case 'ETAPA_1': return 'bg-green-100 text-green-800';
      case 'ETAPA_2': return 'bg-yellow-100 text-yellow-800';
      case 'ETAPA_3': return 'bg-orange-100 text-orange-800';
      case 'ETAPA_4': return 'bg-red-100 text-red-800';
      case 'ETAPA_5': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (recomendacionesPendientes) => {
    if (recomendacionesPendientes > 5) return 'bg-red-100 text-red-800';
    if (recomendacionesPendientes > 2) return 'bg-orange-100 text-orange-800';
    if (recomendacionesPendientes > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mis Pacientes</h1>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{estadisticas.total}</span> pacientes
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{estadisticas.etapa1}</div>
          <div className="text-sm text-gray-600">Etapa 1</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-yellow-600">{estadisticas.etapa2}</div>
          <div className="text-sm text-gray-600">Etapa 2</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-600">{estadisticas.etapa3}</div>
          <div className="text-sm text-gray-600">Etapa 3+</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-2xl font-bold text-red-600">{estadisticas.conRecomendaciones}</div>
          <div className="text-sm text-gray-600">Con Recomendaciones</div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar paciente
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre o email del paciente..."
            />
          </div>
          
          <div>
            <label htmlFor="etapa" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por etapa
            </label>
            <select
              id="etapa"
              value={filterEtapa}
              onChange={(e) => setFilterEtapa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las etapas</option>
              <option value="ETAPA_1">Etapa 1</option>
              <option value="ETAPA_2">Etapa 2</option>
              <option value="ETAPA_3">Etapa 3</option>
              <option value="ETAPA_4">Etapa 4</option>
              <option value="ETAPA_5">Etapa 5</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPacientes.length > 0 ? (
          <div className="divide-y">
            {filteredPacientes.map((paciente) => (
              <div key={paciente.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {paciente.nombre}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEtapaColor(paciente.etapaParkinson)}`}>
                          {paciente.etapaParkinson ? paciente.etapaParkinson.replace('_', ' ') : 'NO ESPECIFICADA'}
                        </span>
                      </div>
                      
                      {paciente.recomendacionesPendientes > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(paciente.recomendacionesPendientes)}`}>
                          {paciente.recomendacionesPendientes} recom. pendientes
                        </span>
                      )}
                    </div>

                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Edad:</span>
                        {paciente.edad ? `${paciente.edad} años` : 'No especificada'}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Género:</span>
                        {paciente.genero || 'No especificado'}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Contacto:</span>
                        {paciente.telefono || paciente.email}
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {paciente.ultimaCita && (
                        <span className="flex items-center">
                          <span className="mr-1">📅</span>
                          Última cita: {new Date(paciente.ultimaCita).toLocaleDateString()}
                        </span>
                      )}
                      
                      {paciente.fechaDiagnostico && (
                        <span className="flex items-center">
                          <span className="mr-1">🏥</span>
                          Diagnóstico: {new Date(paciente.fechaDiagnostico).toLocaleDateString()}
                        </span>
                      )}

                      <span className="flex items-center">
                        <span className="mr-1">💊</span>
                        Recomendaciones: {paciente.recomendacionesPendientes || 0}
                      </span>
                    </div>

                    {/* Medicamentos (si existen) */}
                    {paciente.medicamentosActuales && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-700">Medicamentos:</span>
                        <p className="text-xs text-gray-600 truncate">{paciente.medicamentosActuales}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    <Link
                      to={`/doctor/pacientes/${paciente.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm text-center transition-colors"
                    >
                      Ver Detalles
                    </Link>
                    
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm transition-colors">
                      Nueva Cita
                    </button>
                    
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm transition-colors">
                      Enviar Mensaje
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-3">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterEtapa ? 'No se encontraron pacientes' : 'No tienes pacientes asignados'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterEtapa 
                ? 'Intenta con otros términos de búsqueda o elimina los filtros.'
                : 'Los pacientes asignados aparecerán aquí.'
              }
            </p>
            {(searchTerm || filterEtapa) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterEtapa('');
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Información del total */}
      {filteredPacientes.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredPacientes.length} de {pacientes.length} pacientes
          {(searchTerm || filterEtapa) && ' (filtrados)'}
        </div>
      )}
    </div>
  );
};

export default ListaPacientes;