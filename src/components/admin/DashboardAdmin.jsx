import { useEffect, useState } from "react";

export const AdminDashboard = ({ userData, token, onLogout }) => {
  const [systemStats, setSystemStats] = useState({
    totalUsuarios: 0,
    doctores: 0,
    pacientes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setTimeout(() => {
        setSystemStats({
          totalUsuarios: 50,
          doctores: 10,
          pacientes: 40
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏥 Parkinson Care</h1>
              <p className="text-sm text-gray-600 mt-1">
                Panel de Administración - <span className="font-semibold">{userData.nombre || userData.username}</span>
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-3xl font-bold text-purple-600">{systemStats.totalUsuarios}</p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doctores</p>
                <p className="text-3xl font-bold text-blue-600">{systemStats.doctores}</p>
              </div>
              <User className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacientes</p>
                <p className="text-3xl font-bold text-green-600">{systemStats.pacientes}</p>
              </div>
              <Activity className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Gestión del Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Usuarios</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
              <Settings className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Configuración</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Reportes</span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
              <FileText className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Auditoría</span>
            </button>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Actividad del Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm font-medium">Nuevo usuario registrado</p>
                <p className="text-xs text-gray-600">Dr. Carlos Ruiz - Hace 1 hora</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm font-medium">Configuración actualizada</p>
                <p className="text-xs text-gray-600">Sistema - Hace 3 horas</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
