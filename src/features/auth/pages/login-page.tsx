import { motion } from 'framer-motion';
import { LoginForm } from '../components/forms/login-form';

/**
 * Página de inicio de sesión.
 * Permite a los usuarios autenticarse en la aplicación.
 * 
 * @example
 * ```tsx
 * <Route path="/login" element={<LoginPage />} />
 * ```
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <LoginForm />
      </motion.div>
    </div>
  );
}