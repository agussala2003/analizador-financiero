// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useError } from '../context/ErrorContext'; // 👈 Importamos el hook
import { logger } from '../lib/logger';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { showError } = useError();

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/update-password` });

            if (error) throw error;

            logger.info('PASSWORD_RESET_EMAIL_SENT', `Password reset email sent to: ${email}`);
            setMessage('Si existe una cuenta con este email, recibirás un enlace para resetear tu contraseña.');

        } catch (error) {
            logger.error('PASSWORD_RESET_FAILED', 'Failed to send password reset email', { errorMessage: error.message });
            showError('No se pudo enviar el correo de recuperación.', { title: 'Error de Servidor', detail: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full border border-gray-700 bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white mb-4">Resetear Contraseña</h2>
                <p className="text-center text-gray-400 mb-6">Ingresá tu email y te enviaremos un enlace para recuperar tu cuenta.</p>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500"
                    >
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                </form>
                {message && <p className="text-green-500 mt-4 text-center">{message}</p>}
                <p className="mt-4 text-center">
                    <Link to="/login" className="text-blue-500 hover:underline">Volver a Iniciar Sesión</Link>
                </p>
            </div>
        </div>
    );
}