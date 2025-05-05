import axios from 'axios';

console.log('Inicializando authService.js'); // Depuración

const api = axios.create({
  baseURL: 'http://localhost:8080/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      console.log('loginUser response:', response);
      return response;      // <-- Devuelve el objeto completo
    } catch (error) {
      console.error('Error en loginUser:', error);
      if (error.response) {
        throw new Error('Credenciales incorrectas');
      } else if (error.request) {
        throw new Error('No se pudo conectar al servidor.');
      } else {
        throw new Error(error.message);
      }
    }
  };

export const registerUser = async (userData) => {
  console.log('Ejecutando registerUser con datos:', userData);
  try {
    const response = await api.post('/registrar', userData);
    console.log('Respuesta exitosa del servidor:', response.data);
    return response;
  } catch (error) {
    console.error('Error en registerUser:', error);
    if (error.response) {
      throw new Error(`Error de servidor: ${error.response.data.message || 'Error desconocido'}`);
    } else if (error.request) {
      throw new Error('No se pudo conectar al servidor');
    } else {
      throw new Error(`Error desconocido: ${error.message}`);
    }
  }
};

// Prueba de solicitud para depuración
export const testApi = async () => {
  try {
    console.log('Probando conexión con el backend');
    const response = await api.get('/test'); // Endpoint ficticio
    console.log('Respuesta de prueba:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en testApi:', error);
    throw error;
  }
};

export { api };