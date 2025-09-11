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
  const [loading, setLoading] = useState(false); // 👈 Añadimos estado de carga
  const [message, setMessage] = useState('');
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
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
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