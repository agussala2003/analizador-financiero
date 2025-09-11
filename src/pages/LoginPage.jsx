// src/pages/LoginPage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useError } from '../hooks/useError';
import { logger } from '../lib/logger';
import Loader from '../components/ui/Loader';
import EyeOffIcon from '../components/svg/eyeOff';
import EyeIcon from '../components/svg/eye';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 1. Estado para visibilidad
  const navigate = useNavigate();
  const { showError } = useError();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

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
            disabled={loading}
          />
          {/* --- Contenedor del Input de Contraseña --- */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} // 👈 2. Tipo dinámico
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500" // pr-10 para el ícono
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // 👈 3. Toggle de visibilidad
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <Loader variant="spin" size="sm" color="white" message="Ingresando..." /> : 'Ingresar'}
          </button>
        </form>
        
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