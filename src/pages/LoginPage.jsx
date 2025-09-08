// src/pages/LoginPage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useError } from '../context/ErrorContext'; // 👈 1. Importamos el hook de errores
import { logger } from '../lib/logger';
import SEO from '../components/SEO';
import { useConfig } from '../context/ConfigContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 👈 2. Añadimos el estado de carga
  const navigate = useNavigate();
  const { showError } = useError(); // Obtenemos la función para mostrar el modal
  const config = useConfig();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Activamos el loader al iniciar

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email, password: password });
      if (error) throw error;
      logger.info('LOGIN_SUCCESS', `User ${email} logged in successfully.`);
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      logger.error('LOGIN_FAILED', `User ${email} failed to log in.`, { errorMessage: error.message });
      showError('Email o contraseña incorrectos.', { title: 'Error de Autenticación', detail: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SEO
        title={config.app.name}
        description={config.infoPage.hero.subtitle}
        noindex
      />
      <div className="max-w-md w-full border border-gray-700 bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading} // Desactivamos el input mientras carga
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading} // Desactivamos el input mientras carga
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={loading} // 5. Desactivamos el botón mientras carga
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        {/* Ya no necesitamos el <p> de error local, el modal se encargará */}
        
        <p className="text-center text-gray-400 mt-4 text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-blue-400 hover:underline">Regístrate</Link>
        </p>
        <p className="text-center text-gray-400 mt-2 text-sm">
          <Link to="/forgot-password" className="text-blue-400 hover:underline">¿Olvidaste tu contraseña?</Link>
        </p>
      </div>
    </div>
  );
}