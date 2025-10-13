// src/features/auth/components/shared/form-footer.tsx

import { NavLink } from 'react-router-dom';

/**
 * Props para el componente FormFooter.
 * @property text - Texto principal
 * @property linkText - Texto del enlace
 * @property linkTo - URL del enlace
 */
interface FormFooterProps {
  text: string;
  linkText: string;
  linkTo: string;
}

/**
 * Footer reutilizable para formularios de autenticación.
 * Muestra un texto con un enlace a otra página (ej: "¿No tienes cuenta? Crear cuenta").
 * 
 * @example
 * ```tsx
 * <FormFooter
 *   text="¿No tienes una cuenta?"
 *   linkText="Crear cuenta"
 *   linkTo="/register"
 * />
 * ```
 */
export function FormFooter({ text, linkText, linkTo }: FormFooterProps) {
  return (
    <div className="mt-4 text-center body-sm">
      {text}{' '}
      <NavLink to={linkTo} className="underline underline-offset-4">
        {linkText}
      </NavLink>
    </div>
  );
}
