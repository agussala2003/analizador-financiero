import { motion } from 'framer-motion';
import { RegisterForm } from '../components/forms/register-form';

/**
 * Página de registro de usuarios.
 * Permite crear una nueva cuenta en la aplicación.
 * 
 * @example
 * ```tsx
 * <Route path="/register" element={<RegisterPage />} />
 * ```
 */
export default function RegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <RegisterForm />
      </motion.div>
    </div>
  );
}