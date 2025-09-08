// src/pages/VerifyEmailPage.jsx
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import SEO from '../components/SEO';
import { useConfig } from '../context/ConfigContext';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const initialEmail = params.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const config = useConfig();

  const handleResend = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);
    try {
      // Reenvía el correo de confirmación de registro
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      if (error) throw error;
      logger.info('RESEND_VERIFICATION_EMAIL', `Verification email resent to ${email}`);
      setStatus({ type: 'ok', msg: 'Te enviamos un nuevo correo de verificación. Revisá tu bandeja (y Spam).' });
    } catch (err) {
      logger.error('RESEND_VERIFICATION_EMAIL_FAILED', `Failed to resend verification email to ${email}`, { errorMessage: err.message });
      setStatus({ type: 'err', msg: err.message || 'No se pudo reenviar el correo.' });
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
        <h2 className="text-2xl font-bold text-center text-white mb-2">Verificá tu correo</h2>
        <p className="text-gray-300 text-sm text-center mb-4">
          Te enviamos un email con un enlace para confirmar tu cuenta.
          <br /> Abrí ese correo y hacé clic en “Confirmar”.
        </p>

        <form onSubmit={handleResend} className="space-y-3">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500"
          >
            {loading ? 'Reenviando…' : 'Reenviar correo de verificación'}
          </button>
        </form>

        {status.msg && (
          <p className={`mt-4 text-center text-sm ${status.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
            {status.msg}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Ya confirmaste? <Link to="/login" className="text-blue-400 hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
