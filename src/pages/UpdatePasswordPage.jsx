// src/pages/UpdatePasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useError } from '../hooks/useError';
import { logger } from '../lib/logger';
import Loader from '../components/ui/Loader';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 👇 1. Estados de visibilidad para cada campo
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { showError } = useError();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      logger.info('PASSWORD_UPDATED', 'User password updated successfully');
      setMessage('¡Contraseña actualizada con éxito! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      logger.error('PASSWORD_UPDATE_FAILED', 'Failed to update user password', { errorMessage: error.message });
      showError('No se pudo actualizar la contraseña.', { title: 'Error de Actualización', detail: 'El enlace puede haber expirado o ser inválido. Por favor, solicitá uno nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="max-w-md w-full border border-gray-700 bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Crear Nueva Contraseña</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* --- Primer Input de Contraseña --- */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {/* --- Segundo Input de Contraseña --- */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar Nueva Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
             <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500"
          >
            {loading ? <Loader variant="spin" size="sm" color="white" message="Actualizando..." /> : 'Actualizar Contraseña'}
          </button>
        </form>
        {message && <p className="text-green-400 text-sm mt-4 text-center">{message}</p>}
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