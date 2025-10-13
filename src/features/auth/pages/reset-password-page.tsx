// src/features/auth/pages/reset-password-page.tsx

import { motion } from 'framer-motion';
import { ResetPasswordForm } from '../components/forms/reset-password-form';

/**
 * Página de restablecimiento de contraseña.
 * Permite al usuario establecer una nueva contraseña después de recibir
 * el link de recuperación por email.
 * 
 * @example
 * ```tsx
 * <Route path="/reset-password" element={<ResetPasswordPage />} />
 * ```
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <ResetPasswordForm />
      </motion.div>
    </div>
  );
}
