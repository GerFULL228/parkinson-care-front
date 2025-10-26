import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/UseApi';
import { sintomasService } from '../../services/sintomasService';

const SintomasPaciente = () => {
  const { data: historialData, loading, error, refetch } = useApi(() => 
    sintomasService.getHistorial()
  );

  const [formData, setFormData] = useState({
    nivelTemblor: 1,
    nivelRigidez: 1,
    nivelBradicinesia: 1,
    nivelEquilibrio: 1,
    sintomasAdicionales: '',
    notas: ''
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🔍 DEBUG COMPLETO
 useEffect(() => {
  console.log('=== 🔍 DEBUG SÍNTOMAS ===');
  console.log('📊 historialData:', historialData);
  console.log('🔍 Tipo:', typeof historialData);
  console.log('🔍 Es array?', Array.isArray(historialData));
  
  if (historialData) {
    console.log('✅ success:', historialData.success);
    console.log('📝 message:', historialData.message);
    console.log('🗂️ data:', historialData.data);
    console.log('📈 length directo:', historialData.length);
    console.log('📈 length data:', historialData.data?.length);
    
    // Ver estructura completa
    console.log('🔎 Keys del objeto:', Object.keys(historialData));
  }
  
  console.log('🔄 loading:', loading);
  console.log('❌ error:', error);
}, [historialData, loading, error]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage('');

    try {
      console.log('📤 Enviando datos al backend:', formData);
      const response = await sintomasService.registrarSintoma(formData);
      console.log('✅ Respuesta del backend:', response);
      
      if (response.success) {
        setMessage('✅ Síntomas registrados exitosamente');
        setFormData({
          nivelTemblor: 1,
          nivelRigidez: 1,
          nivelBradicinesia: 1,
          nivelEquilibrio: 1,
          sintomasAdicionales: '',
          notas: ''
        });
        
        // Esperar un poco y luego recargar
        setTimeout(() => {
          console.log('🔄 Recargando historial...');
          refetch();
        }, 1000);
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error('💥 Error completo:', error);
      console.error('💥 Response data:', error.response?.data);
      setMessage('❌ Error al registrar síntomas: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ... el resto del componente se mantiene igual
  const getNivelColor = (nivel) => {
    if (nivel <= 3) return 'text-green-600';
    if (nivel <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeveridadTexto = (nivel) => {
    if (nivel <= 3) return 'Leve';
    if (nivel <= 7) return 'Moderado';
    return 'Severo';
  };

  // 🔍 Verificar también el token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('🔐 Token:', token ? 'PRESENTE' : 'AUSENTE');
    console.log('👤 User:', user);
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-4 text-gray-600">Cargando síntomas...</span>
    </div>
  );

  if (error) {
    console.log('💥 Error en la UI:', error);
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error al cargar síntomas: {error}
        <button 
          onClick={() => refetch()}
          className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

// 🔍 IMPORTANTE: Verificar la estructura de los datos
const historial = Array.isArray(historialData)
  ? historialData
  : historialData?.data || [];
  console.log('📋 Historial a mostrar:', historial);
console.log('🔍 Tipo de historialData:', typeof historialData);
console.log('🔍 Es array?', Array.isArray(historialData));

  return (
    <div className="space-y-6">
      {/* 🔍 Debug info en desarrollo */}
     

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Registro de Síntomas</h1>
        <button
          onClick={() => {
            console.log('🔄 Forzando recarga...');
            refetch();
          }}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200"
        >
          🔄 Actualizar
        </button>
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

      {/* ... el resto del JSX se mantiene igual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de registro */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Registrar Nuevos Síntomas</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { key: 'nivelTemblor', label: 'Temblor', emoji: '🫨' },
              { key: 'nivelRigidez', label: 'Rigidez', emoji: '💪' },
              { key: 'nivelBradicinesia', label: 'Bradicinesia', emoji: '🐌' },
              { key: 'nivelEquilibrio', label: 'Problemas de Equilibrio', emoji: '🎯' }
            ].map(({ key, label, emoji }) => (
              <div key={key} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    {emoji} {label}
                  </label>
                  <span className={`text-lg font-bold ${getNivelColor(formData[key])}`}>
                    {formData[key]} - {getSeveridadTexto(formData[key])}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData[key]}
                  onChange={(e) => setFormData({
                    ...formData,
                    [key]: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                
                <div className="flex justify-between text-xs text-gray-500 px-1">
                  <span>1 (Mínimo)</span>
                  <span>5 (Moderado)</span>
                  <span>10 (Máximo)</span>
                </div>
              </div>
            ))}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Síntomas Adicionales (Opcional)
                </label>
                <textarea
                  value={formData.sintomasAdicionales}
                  onChange={(e) => setFormData({...formData, sintomasAdicionales: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  rows="3"
                  placeholder="Describe otros síntomas que hayas experimentado..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💭 Notas Personales (Opcional)
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  rows="3"
                  placeholder="Agrega cualquier observación o comentario adicional..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
            >
              {submitLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </span>
              ) : (
                '📋 Registrar Síntomas'
              )}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Historial Reciente</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {historial.length} registros
            </span>
          </div>
          
          {historial.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {historial.slice(0, 10).map((registro) => (
                <div key={registro.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      {new Date(registro.fechaRegistro).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(registro.fechaRegistro).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: '🫨 Temblor', value: registro.nivelTemblor },
                      { label: '💪 Rigidez', value: registro.nivelRigidez },
                      { label: '🐌 Bradicinesia', value: registro.nivelBradicinesia },
                      { label: '🎯 Equilibrio', value: registro.nivelEquilibrio }
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-gray-600">{label}</span>
                        <span className={`font-semibold ${getNivelColor(value)}`}>
                          {value}/10
                        </span>
                      </div>
                    ))}
                  </div>

                  {(registro.sintomasAdicionales || registro.notas) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {registro.sintomasAdicionales && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Síntomas adicionales:</span> {registro.sintomasAdicionales}
                        </p>
                      )}
                      {registro.notas && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notas:</span> {registro.notas}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-lg mb-2">No hay registros de síntomas</p>
              <p className="text-sm">Comienza registrando tus primeros síntomas usando el formulario</p>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {historial.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumen de Síntomas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Temblor Promedio', value: Math.round(historial.reduce((sum, r) => sum + r.nivelTemblor, 0) / historial.length) },
              { label: 'Rigidez Promedio', value: Math.round(historial.reduce((sum, r) => sum + r.nivelRigidez, 0) / historial.length) },
              { label: 'Bradicinesia Promedio', value: Math.round(historial.reduce((sum, r) => sum + r.nivelBradicinesia, 0) / historial.length) },
              { label: 'Equilibrio Promedio', value: Math.round(historial.reduce((sum, r) => sum + r.nivelEquilibrio, 0) / historial.length) }
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{value}</div>
                <div className="text-sm text-gray-600 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SintomasPaciente;