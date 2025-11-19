import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/UseApi';
import { citasService } from '../../services/citaService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';

const CitasPaciente = () => {
  // ✅ CORREGIDO: Usar getCitas en lugar de Citas
  const { data: citasResponse, loading, error, refetch } = useApi(() => 
    citasService.getMisCitas()
  );

  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [doctores, setDoctores] = useState([]);
  const [doctoresDisponibles, setDoctoresDisponibles] = useState([]);
  const [loadingDoctores, setLoadingDoctores] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: '',
    fechaHora: '',
    motivo: '',
    notas: ''
  });

  // ✅ CORREGIDO: Extraer citas del response
  const citas = citasResponse?.data || [];

  // 🔍 DEBUG MEJORADO
  useEffect(() => {
    console.log('=== 🔍 DEBUG CITAS COMPLETO ===');
    console.log('📊 citasResponse:', citasResponse);
    console.log('📋 citas (array):', citas);
    console.log('📏 Total citas:', citas.length);
    
    if (citas.length > 0) {
      console.log('🎯 Primera cita:', citas[0]);
      console.log('🔑 Keys de la cita:', Object.keys(citas[0]));
    }
  }, [citasResponse, citas]);

  // Cargar lista de doctores al montar el componente
  useEffect(() => {
    cargarDoctores();
  }, []);

  // Cargar doctores disponibles cuando cambia la fecha
  useEffect(() => {
    if (formData.fechaHora) {
      cargarDoctoresDisponibles();
    }
  }, [formData.fechaHora]);

  const cargarDoctores = async () => {
    try {
      setLoadingDoctores(true);
      const response = await doctorService.getDoctores();
      if (response.success) {
        setDoctores(response.data);
      }
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      setMessage('❌ Error al cargar la lista de doctores');
    } finally {
      setLoadingDoctores(false);
    }
  };

  const cargarDoctoresDisponibles = async () => {
    if (!formData.fechaHora) return;

    try {
      setLoadingDoctores(true);
      const fechaHora = new Date(formData.fechaHora);
      const response = await doctorService.getDoctoresDisponibles(fechaHora);
      
      if (response.success) {
        setDoctoresDisponibles(response.data);
        if (formData.doctorId && !response.data.some(d => d.id == formData.doctorId)) {
          setFormData(prev => ({ ...prev, doctorId: '' }));
          setMessage('⚠️ El doctor seleccionado no está disponible en esa fecha/hora');
        }
      }
    } catch (error) {
      console.error('Error al cargar doctores disponibles:', error);
    } finally {
      setLoadingDoctores(false);
    }
  };

  const handleCreateCita = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setMessage('');

    if (!formData.doctorId) {
      setMessage('❌ Por favor selecciona un doctor');
      setCreateLoading(false);
      return;
    }

    if (!formData.fechaHora) {
      setMessage('❌ Por favor selecciona una fecha y hora');
      setCreateLoading(false);
      return;
    }

    if (!formData.motivo.trim()) {
      setMessage('❌ Por favor ingresa el motivo de la consulta');
      setCreateLoading(false);
      return;
    }

    try {
      // ✅ CORREGIDO: No enviar pacienteId (el backend lo obtiene automáticamente)
      const citaData = {
        doctorId: formData.doctorId,
        fechaHora: new Date(formData.fechaHora).toISOString(),
        motivo: formData.motivo,
        notas: formData.notas || ''
      };

      console.log('📤 Enviando datos de cita:', citaData);

      const response = await citasService.crearCita(citaData);
      
      if (response.success) {
        // ✅ MENSAJE ACTUALIZADO PARA SISTEMA DE CONFIRMACIÓN
        setMessage('✅ Cita creada exitosamente. Te notificaremos cuando el doctor confirme tu cita.');
        setShowCreateForm(false);
        setFormData({ doctorId: '', fechaHora: '', motivo: '', notas: '' });
        setDoctoresDisponibles([]);
        refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error completo:', error);
      setMessage('❌ Error al crear cita: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCita = async (citaId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      const response = await citasService.cancelarCita(citaId);
      
      if (response.success) {
        setMessage('✅ Cita cancelada exitosamente');
        refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error al cancelar cita: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReprogramarCita = async (citaId) => {
    const nuevaFecha = prompt('Ingresa la nueva fecha y hora (YYYY-MM-DDTHH:MM):');
    if (!nuevaFecha) return;

    try {
      const response = await citasService.reprogramarCita(citaId, new Date(nuevaFecha));
      
      if (response.success) {
        setMessage('✅ Cita reprogramada exitosamente. Espera la confirmación del doctor para la nueva fecha.');
        refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      setMessage('❌ Error al reprogramar cita: ' + (error.response?.data?.message || error.message));
    }
  };

  // ✅ CORREGIDO: Manejo seguro de datos del doctor
  const getDoctorInfo = (cita) => {
    if (!cita.doctorNombre) {
      return 'Doctor no disponible';
    }
    return `Dr. ${cita.doctorNombre}${cita.doctorEspecialidad ? ` - ${cita.doctorEspecialidad}` : ''}`;
  };

  // ✅ NUEVO: Función para obtener información del estado
  const getEstadoInfo = (estado) => {
    const estados = {
      PENDIENTE: { 
        texto: '⏳ Pendiente de confirmación', 
        color: 'bg-yellow-100 text-yellow-800',
        mensaje: 'Esperando que el doctor confirme tu cita',
        puedeCancelar: true,
        puedeReprogramar: false
      },
      CONFIRMADA: { 
        texto: '✅ Confirmada por el doctor', 
        color: 'bg-green-100 text-green-800',
        mensaje: 'El doctor ha confirmado tu cita',
        puedeCancelar: true,
        puedeReprogramar: true
      },
      PROGRAMADA: { 
        texto: '📅 Programada', 
        color: 'bg-blue-100 text-blue-800',
        mensaje: 'Cita confirmada y programada',
        puedeCancelar: true,
        puedeReprogramar: true
      },
      COMPLETADA: { 
        texto: '✅ Completada', 
        color: 'bg-gray-100 text-gray-800',
        mensaje: 'Cita atendida y completada',
        puedeCancelar: false,
        puedeReprogramar: false
      },
      CANCELADA: { 
        texto: '❌ Cancelada', 
        color: 'bg-red-100 text-red-800',
        mensaje: 'Cita cancelada',
        puedeCancelar: false,
        puedeReprogramar: false
      },
      RECHAZADA: { 
        texto: '❌ Rechazada por el doctor', 
        color: 'bg-red-100 text-red-800 border border-red-300',
        mensaje: 'Lo sentimos, el doctor ha rechazado tu cita',
        puedeCancelar: false,
        puedeReprogramar: false
      },
      REPROGRAMADA: { 
        texto: '📅 Reprogramada', 
        color: 'bg-purple-100 text-purple-800',
        mensaje: 'Cita reprogramada - Esperando confirmación',
        puedeCancelar: true,
        puedeReprogramar: false
      }
    };
    return estados[estado] || { 
      texto: estado, 
      color: 'bg-gray-100 text-gray-800', 
      mensaje: '',
      puedeCancelar: false,
      puedeReprogramar: false
    };
  };

  const getDoctoresParaSelect = () => {
    if (formData.fechaHora && doctoresDisponibles.length > 0) {
      return doctoresDisponibles;
    }
    return doctores;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-4">Cargando citas...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Error al cargar citas: {error}</p>
      <button 
        onClick={() => refetch()}
        className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
      >
        Reintentar
      </button>
    </div>
  );

  // ✅ ACTUALIZADO: Filtrar citas por nuevos estados
  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE');
  const citasConfirmadas = citas.filter(c => c.estado === 'CONFIRMADA');
  const citasProgramadas = citas.filter(c => c.estado === 'PROGRAMADA');
  const citasCompletadas = citas.filter(c => c.estado === 'COMPLETADA');
  const citasCanceladas = citas.filter(c => c.estado === 'CANCELADA');
  const citasRechazadas = citas.filter(c => c.estado === 'RECHAZADA'); // ✅ NUEVO

  return (
    <div className="space-y-6">
      {/* 🔍 DEBUG PANEL MEJORADO */}
      

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
       
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          {showCreateForm ? 'Cancelar' : '+ Nueva Cita'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('❌') 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : message.includes('⚠️')
            ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* ✅ FORMULARIO COMPLETO DE CREACIÓN DE CITA */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Programar Nueva Cita</h2>
          <form onSubmit={handleCreateCita} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selector de Doctor */}
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Doctor
                </label>
                <select
                  id="doctorId"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loadingDoctores}
                >
                  <option value="">{loadingDoctores ? 'Cargando doctores...' : 'Selecciona un doctor'}</option>
                  {getDoctoresParaSelect().map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.nombre} - {doctor.especialidad}
                      {doctor.telefono && ` - 📞 ${doctor.telefono}`}
                    </option>
                  ))}
                </select>
                {formData.fechaHora && (
                  <p className="text-xs text-gray-500 mt-2">
                    {doctoresDisponibles.length > 0 
                      ? `✅ ${doctoresDisponibles.length} doctor(es) disponible(s) en esta fecha/hora`
                      : '❌ No hay doctores disponibles en esta fecha/hora'
                    }
                  </p>
                )}
              </div>

              {/* Selector de Fecha y Hora */}
              <div>
                <label htmlFor="fechaHora" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora de la Cita
                </label>
                <input
                  type="datetime-local"
                  id="fechaHora"
                  value={formData.fechaHora}
                  onChange={(e) => setFormData({...formData, fechaHora: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Selecciona una fecha y hora futura
                </p>
              </div>
            </div>

            {/* Motivo de la consulta */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la Consulta
              </label>
              <textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe el motivo de tu consulta..."
                required
              />
            </div>

            {/* Notas adicionales */}
            <div>
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({...formData, notas: e.target.value})}
                rows="2"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Agrega cualquier información adicional que consideres importante..."
              />
            </div>

            {/* ✅ NUEVO: Información sobre el proceso de confirmación */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Proceso de confirmación
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Después de crear la cita, el doctor deberá confirmarla.</p>
                    <p className="mt-1">Recibirás una notificación cuando tu cita sea confirmada o rechazada.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones del formulario */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ doctorId: '', fechaHora: '', motivo: '', notas: '' });
                  setDoctoresDisponibles([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading || loadingDoctores}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {createLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </span>
                ) : (
                  'Solicitar Cita'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ✅ NUEVA SECCIÓN: Citas Pendientes de Confirmación */}
      {citasPendientes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md">
          <div className="p-6 border-b border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-900 flex items-center">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                {citasPendientes.length}
              </span>
              Citas Pendientes de Confirmación
            </h2>
          </div>
          
          <div className="divide-y divide-yellow-200">
            {citasPendientes.map((cita) => {
              const estadoInfo = getEstadoInfo(cita.estado);
              return (
                <div key={cita.id} className="p-6 hover:bg-yellow-50 transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDoctorInfo(cita)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                          {estadoInfo.texto}
                        </span>
                      </div>
                      
                      <p className="text-sm text-yellow-700 mb-3">
                        {estadoInfo.mensaje}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">📅</span>
                          {new Date(cita.fechaHora).toLocaleString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">🎯</span>
                          {cita.motivo}
                        </div>
                      </div>

                      {cita.notas && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <span className="font-medium text-sm text-gray-700">📝 Notas:</span>
                          <p className="text-sm text-gray-600 mt-1">{cita.notas}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {estadoInfo.puedeCancelar && (
                        <button
                          onClick={() => handleCancelCita(cita.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap transition duration-200"
                        >
                          Cancelar Cita
                        </button>
                      )}
                      
                      {estadoInfo.puedeReprogramar && (
                        <button
                          onClick={() => handleReprogramarCita(cita.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap transition duration-200"
                        >
                          Reprogramar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ SECCIÓN: Citas Confirmadas y Programadas */}
      {(citasConfirmadas.length > 0 || citasProgramadas.length > 0) && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                {citasConfirmadas.length + citasProgramadas.length}
              </span>
              Citas Confirmadas
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {[...citasConfirmadas, ...citasProgramadas].map((cita) => {
              const estadoInfo = getEstadoInfo(cita.estado);
              return (
                <div key={cita.id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDoctorInfo(cita)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                          {estadoInfo.texto}
                        </span>
                      </div>
                      
                      {estadoInfo.mensaje && (
                        <p className="text-sm text-green-700 mb-3">
                          {estadoInfo.mensaje}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">📅</span>
                          {new Date(cita.fechaHora).toLocaleString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">🎯</span>
                          {cita.motivo}
                        </div>
                      </div>

                      {cita.notas && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <span className="font-medium text-sm text-gray-700">📝 Notas:</span>
                          <p className="text-sm text-gray-600 mt-1">{cita.notas}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {estadoInfo.puedeCancelar && (
                        <button
                          onClick={() => handleCancelCita(cita.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap transition duration-200"
                        >
                          Cancelar Cita
                        </button>
                      )}
                      
                      {estadoInfo.puedeReprogramar && (
                        <button
                          onClick={() => handleReprogramarCita(cita.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap transition duration-200"
                        >
                          Reprogramar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ NUEVA SECCIÓN: Citas Rechazadas */}
      {citasRechazadas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-md">
          <div className="p-6 border-b border-red-200">
            <h2 className="text-xl font-semibold text-red-900 flex items-center">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                {citasRechazadas.length}
              </span>
              Citas Rechazadas
            </h2>
          </div>
          
          <div className="divide-y divide-red-200">
            {citasRechazadas.map((cita) => {
              const estadoInfo = getEstadoInfo(cita.estado);
              return (
                <div key={cita.id} className="p-6 hover:bg-red-50 transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getDoctorInfo(cita)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                          {estadoInfo.texto}
                        </span>
                      </div>
                      
                      <p className="text-sm text-red-700 mb-3">
                        {estadoInfo.mensaje}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">📅</span>
                          Fecha solicitada: {new Date(cita.fechaHora).toLocaleString('es-ES')}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">🎯</span>
                          {cita.motivo}
                        </div>
                      </div>

                      {cita.notas && (
                        <div className="mt-3 p-3 bg-red-100 rounded-md">
                          <span className="font-medium text-sm text-red-700">📝 Notas del doctor:</span>
                          <p className="text-sm text-red-600 mt-1">{cita.notas}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap transition duration-200"
                      >
                        Nueva Cita
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección de Citas Completadas */}
      {citasCompletadas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                {citasCompletadas.length}
              </span>
              Citas Completadas
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {citasCompletadas.map((cita) => (
              <div key={cita.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getDoctorInfo(cita)}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        COMPLETADA
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-gray-700 mr-2">📅</span>
                        {new Date(cita.fechaHora).toLocaleString('es-ES')}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">🎯</span>
                        {cita.motivo}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de Citas Canceladas */}
      {citasCanceladas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                {citasCanceladas.length}
              </span>
              Citas Canceladas
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {citasCanceladas.map((cita) => (
              <div key={cita.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getDoctorInfo(cita)}
                      </h3>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        CANCELADA
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-gray-700 mr-2">📅</span>
                        {new Date(cita.fechaHora).toLocaleString('es-ES')}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">🎯</span>
                        {cita.motivo}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ MENSAJE CUANDO NO HAY CITAS */}
      {citas.length === 0 && !showCreateForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes citas programadas
          </h3>
          <p className="text-gray-600 mb-4">
            Programa tu primera cita para comenzar a recibir atención médica.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            + Programar Mi Primera Cita
          </button>
        </div>
      )}
    </div>
  );
};

export default CitasPaciente;