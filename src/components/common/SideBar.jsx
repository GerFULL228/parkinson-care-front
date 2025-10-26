import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  User, 
  Activity, 
  Calendar, 
  Users,
  Stethoscope,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { isPaciente, isDoctor } = useAuth();

  const pacienteLinks = [
    { to: '/paciente/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/paciente/perfil', icon: User, label: 'Mi Perfil' },
    { to: '/paciente/sintomas', icon: Activity, label: 'Síntomas' },
    { to: '/paciente/citas', icon: Calendar, label: 'Mis Citas' },
    { to: '/paciente/recomendaciones', icon: Stethoscope, label: 'Recomendaciones' },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/doctor/pacientes', icon: Users, label: 'Pacientes' },
    { to: '/doctor/citas', icon: Calendar, label: 'Citas' },
    { to: '/doctor/perfil', icon: User, label: 'Mi Perfil' },
  ];

  const links = isPaciente ? pacienteLinks : isDoctor ? doctorLinks : [];

  return (
    <div className="w-64 bg-gray-800 text-white">
      <nav className="mt-5 px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-base font-medium rounded-md mb-1 transition ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <link.icon className="mr-4 h-6 w-6" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;