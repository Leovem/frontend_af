import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    nombre: '',
    contrasena: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('Componente Login renderizado'); // Depuración inicial

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Cambio en ${name}: ${value}`); // Depuración
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    // Validación simple
    if (credentials.nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      setLoading(false);
      return;
    }
  
    try {
      // Devuelve todo el response
      const response = await loginUser(credentials);
  
      // Compruebas el status HTTP
      if (response.status === 200) {
        // Suponiendo que el backend devuelve datos de usuario
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/dashboard');
      } else {
        // Aquí manejas otros códigos 4xx o 5xx
        setError(response.data || 'Credenciales incorrectas');
      }
    } catch (err) {
      // Captura errores lanzados por loginUser()
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo-container">
          <BuildingOfficeIcon />
          <h1>Activos Fijos</h1>
        </div>
        <h2>Iniciar Sesión</h2>
        {error && (
          <div className="error">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={credentials.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={credentials.contrasena}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="footer-text">Gestión de Activos Fijos y Presupuestos</p>
      </div>
    </div>
  );
};

export default Login;