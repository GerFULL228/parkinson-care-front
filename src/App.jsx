import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Sidebar from './components/common/SideBar';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Paciente Components
import DashboardPaciente from './components/paciente/DashboardPaciente';
import PerfilPaciente from './components/paciente/PerfilPaciente';
import SintomasPaciente from './components/paciente/SintomasPaciente';
import CitasPaciente from './components/paciente/CitasPaciente';
import RecomendacionesPaciente from './components/paciente/RecomendacionesPaciente';

// Doctor Components
import DashboardDoctor from './components/doctor/DashboardDoctor';
import ListaPacientes from './components/doctor/ListaPacientes';
import DetallePaciente from './components/doctor/DetallePaciente';
import CitasDoctor from './components/doctor/CitasDoctor';
import PerfilDoctor from './components/doctor/PerfilDoctor';

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isPaciente, isDoctor } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro/paciente" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Paciente Routes */}
        {isPaciente && (
          <>
            <Route path="/paciente/dashboard" element={
              <ProtectedRoute allowedRoles={['PACIENTE']}>
                <DashboardPaciente />
              </ProtectedRoute>
            } />
            <Route path="/paciente/perfil" element={
              <ProtectedRoute allowedRoles={['PACIENTE']}>
                <PerfilPaciente />
              </ProtectedRoute>
            } />
            <Route path="/paciente/sintomas" element={
              <ProtectedRoute allowedRoles={['PACIENTE']}>
                <SintomasPaciente />
              </ProtectedRoute>
            } />
            <Route path="/paciente/citas" element={
              <ProtectedRoute allowedRoles={['PACIENTE']}>
                <CitasPaciente />
              </ProtectedRoute>
            } />
            <Route path="/paciente/recomendaciones" element={
              <ProtectedRoute allowedRoles={['PACIENTE']}>
                <RecomendacionesPaciente />
              </ProtectedRoute>
            } />
          </>
        )}

        {/* Doctor Routes */}
        {isDoctor && (
          <>
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardDoctor />
              </ProtectedRoute>
            } />
            <Route path="/doctor/pacientes" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <ListaPacientes />
              </ProtectedRoute>
            } />
            <Route path="/doctor/pacientes/:id" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DetallePaciente />
              </ProtectedRoute>
            } />
            <Route path="/doctor/citas" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <CitasDoctor />
              </ProtectedRoute>
            } />
            <Route path="/doctor/perfil" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <PerfilDoctor />
              </ProtectedRoute>
            } />
          </>
        )}

        {/* Default redirect */}
        <Route path="/" element={
          <Navigate to={
            isPaciente ? '/paciente/dashboard' : 
            isDoctor ? '/doctor/dashboard' : '/login'
          } replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // <--- Agrega esto

  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      const result = await authService.login(username, password);
      
      if (result.token) {
        setUser({
          username: result.username || username,
          nombre: result.nombre || username,
          rol: result.rol,
          token: result.token
        });
        return { success: true, data: result };
      }
      return { success: false, message: 'Error en el login' };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;