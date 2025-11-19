import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    nombre: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    direccion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctorAsignado, setDoctorAsignado] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setDoctorAsignado(null);

    if (!formData.fechaNacimiento) {
      setError('La fecha de nacimiento es requerida');
      setLoading(false);
      return;
    }

    const fechaNac = new Date(formData.fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 18) {
      setError('Debes ser mayor de 18 años para registrarte');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.registerPaciente(formData);
      
      if (response.success) {
        setSuccess('✅ ¡Registro exitoso! Redirigiendo al login...');
        
        if (response.data.doctorAsignado) {
          setDoctorAsignado(response.data.doctorAsignado);
        }
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error completo:', error);
      setError(error.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
            <span className="text-3xl">👨‍⚕️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Registro de Paciente
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Completa tus datos para comenzar tu tratamiento especializado
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mensajes de estado */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-red-800">Error en el registro</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-green-800">¡Registro exitoso!</h3>
                      <p className="text-green-700 mt-1">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Asignado */}
              {doctorAsignado && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">👨‍⚕️</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-blue-900">
                        Doctor Asignado
                      </h3>
                      <p className="text-blue-800 font-medium mt-1">
                        Dr. {doctorAsignado.nombre}
                        {doctorAsignado.especialidad && (
                          <span className="text-blue-600 font-normal"> • {doctorAsignado.especialidad}</span>
                        )}
                      </p>
                      <p className="text-blue-700 text-sm mt-2">
                        Este profesional te acompañará y guiará durante todo tu tratamiento
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección de Información Personal */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
                    Información Personal
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: María García López"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ej: maria@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="fechaNacimiento" className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label htmlFor="genero" className="block text-sm font-semibold text-gray-700 mb-2">
                      Género
                    </label>
                    <select
                      id="genero"
                      name="genero"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={formData.genero}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                      <option value="OTRO">Otro</option>
                      <option value="PREFIERO_NO_DECIR">Prefiero no decir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección de Información de Contacto */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-green-600 rounded-full mr-3"></span>
                    Información de Contacto
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: +51 987 654 321"
                    />
                  </div>

                  <div>
                    <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección
                    </label>
                    <textarea
                      id="direccion"
                      name="direccion"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ej: Av. Principal 123, Lima, Perú"
                    />
                  </div>
                </div>
              </div>

              {/* Sección de Credenciales */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-purple-600 rounded-full mr-3"></span>
                    Credenciales de Acceso
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre de Usuario *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Ej: maria.garcia"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Este será tu nombre para iniciar sesión en la plataforma
                    </p>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      minLength="6"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      La contraseña debe tener al menos 6 caracteres para mayor seguridad
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Importante */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-amber-900">
                      Información importante sobre tu registro
                    </h3>
                    <div className="mt-3 space-y-2 text-amber-800">
                      <div className="flex items-start">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p>Se te asignará automáticamente un doctor especialista en Parkinson</p>
                      </div>
                      <div className="flex items-start">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p>La etapa de Parkinson será determinada por tu doctor después de la evaluación inicial</p>
                      </div>
                      <div className="flex items-start">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <p>Podrás programar citas y acceder a tu historial médico una vez completado el registro</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Registro */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Procesando registro...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Completar Registro
                    </span>
                  )}
                </button>
              </div>

              {/* Enlace a Login */}
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-200"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;