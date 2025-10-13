// src/features/auth/types/auth.types.ts

/**
 * Tipos locales específicos del feature auth.
 */

/**
 * Props para el componente AuthCard.
 */
export interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Props para el input de formulario.
 */
export interface FormInputProps {
  id: string;
  label: string;
  type: 'email' | 'password' | 'text';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
}

/**
 * Props para el footer de formulario con link.
 */
export interface FormFooterProps {
  text: string;
  linkText: string;
  linkTo: string;
}

/**
 * Estado del formulario de autenticación.
 */
export interface AuthFormState {
  email: string;
  password: string;
  loading: boolean;
}

/**
 * Resultado de una operación de autenticación.
 */
export interface AuthResult {
  success: boolean;
  error?: string;
}
