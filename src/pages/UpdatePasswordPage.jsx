// src/pages/UpdatePasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useError } from '../hooks/useError';
import { logger } from '../lib/logger';
import Loader from '../components/ui/Loader';
import EyeOffIcon from '../components/svg/eyeOff';
import EyeIcon from '../components/svg/eye';

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