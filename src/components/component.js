import { authService } from "../services/authService";
import { pacienteService } from "../services/pacienteService";
const API_URL = 'http://localhost:8081/parkinson-care/api';

async function main() {
  // 1. Primero verifica que el servidor esté funcionando
  try {
    const health = await authService.healthCheck();
    console.log('✅ Servidor activo:', health);
  } catch (error) {
    console.error('❌ Servidor no disponible:', error);
    return;
  }

  // 2. Hacer login
  try {
    
    const loginResult = await authService.login('test123', 'password123');
    console.log('✅ Login exitoso:', loginResult);
    
    // Guardar el token
    const token = loginResult.data.token;
    localStorage.setItem('token', token);
    
    // 3. Usar el token para acceder a endpoints protegidos
    
    const perfil = await pacienteService.getPerfil(token);
    console.log('✅ Perfil:', perfil);
    
    const dashboard = await pacienteService.getDashboard(token);
    console.log('✅ Dashboard:', dashboard);
    
    const recomendaciones = await pacienteService.getRecomendaciones(token);
    console.log('✅ Recomendaciones:', recomendaciones);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, options = {}] = args;
  
  // Solo agregar token a URLs de nuestra API
  if (url.includes(API_URL)) {
    const token = localStorage.getItem('token');
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  
  console.log('🌐 Fetch:', url, options);
  const response = await originalFetch(url, options);
  console.log('📨 Response:', response.status, response.statusText);
  
  return response;
};