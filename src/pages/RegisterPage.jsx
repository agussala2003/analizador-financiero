// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useError } from '../hooks/useError';
import { logger } from '../lib/logger';
import Loader from '../components/ui/Loader';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 1. Estado para visibilidad
  const { showError } = useError();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signUp({ email: email, password: password });
      if (error) throw error;
      logger.info('USER_REGISTERED', `New user registered with email: ${email}`);
      setMessage('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
    } catch (error) {
      logger.error('USER_REGISTRATION_FAILED', 'Failed to register new user', { errorMessage: error.message });
      showError('No se pudo completar el registro.', { title: 'Error de Registro', detail: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-gray-700 bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Crear una Cuenta</h2>
        <form onSubmit={handleRegister} className="space-y-4">
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
              placeholder="Contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
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
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500"
          >
            {loading ? <Loader variant="spin" size="sm" color="white" message="Creando cuenta..." /> : 'Registrarse'}
          </button>
        </form>
        {message && <p className="text-green-400 text-sm mt-4 text-center">{message}</p>}
        <p className="text-center text-gray-400 mt-4 text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-400 hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}

// --- Componentes de Íconos ---
function EyeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963
  7.178a1.012 1.012 0 010 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}


function EyeOffIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
    </svg>
  );
}