// src/features/auth/pages/forgot-password-page.tsx

import { motion } from 'framer-motion';
import { ForgotPasswordForm } from '../components/forms/forgot-password-form';

/**
 * Página de recuperación de contraseña.
 * Permite al usuario solicitar un email para resetear su contraseña.
 * 
 * @example
 * ```tsx
 * <Route path="/forgot-password" element={<ForgotPasswordPage />} />
 * ```
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <ForgotPasswordForm />
      </motion.div>
    </div>
  );
}
