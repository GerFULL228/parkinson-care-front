import { DoctorDashboard } from './DoctorDashboard';
import { PacienteDashboard } from './PacienteDashboard';
import { AdminDashboard } from './AdminDashboard';

const Dashboard = ({ userData, onLogout }) => {
  if (!userData || !userData.rol) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error: Datos de usuario no válidos</p>
          <button
            onClick={onLogout}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  const token = userData.token || localStorage.getItem('token');

  switch (userData.rol) {
    case 'DOCTOR':
      return <DoctorDashboard userData={userData} token={token} onLogout={onLogout} />;
    
    case 'PACIENTE':
      return <PacienteDashboard userData={userData} token={token} onLogout={onLogout} />;
    
    case 'ADMIN':
      return <AdminDashboard userData={userData} token={token} onLogout={onLogout} />;
    
    default:
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Rol no reconocido: {userData.rol}</p>
            <button
              onClick={onLogout}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      );
  }
};

export default Dashboard;