// src/features/auth/components/forms/forgot-password-form.tsx

import React from 'react';
import { toast } from 'sonner';
import { cn } from '../../../../lib/utils';
import { AuthCard } from '../shared/auth-card';
import { FormInput } from '../shared/form-input';
import { FormFooter } from '../shared/form-footer';
import { AuthButton } from '../shared/auth-button';
import { sendPasswordResetEmail } from '../../lib/auth-utils';

/**
 * Props para el componente ForgotPasswordForm.
 * @property className - Clases CSS adicionales
 */
interface ForgotPasswordFormProps extends React.ComponentProps<'div'> {
  className?: string;
}

/**
 * Formulario para solicitar recuperación de contraseña.
 * Envía un email con un link para resetear la contraseña.
 * 
 * Incluye:
 * - Campo de email
 * - Botón de submit
 * - Link para volver al login
 * 
 * @example
 * ```tsx
 * <ForgotPasswordForm />
 * ```
 */
export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);

    void (async () => {
      try {
        const result = await sendPasswordResetEmail(email);

        if (!result.success) {
          toast.error(
            'Error al enviar el correo. Verifica que el email sea correcto.'
          );
          return;
        }

        setEmailSent(true);
        toast.success('Correo de recuperación enviado correctamente.');
        toast.info('Revisa tu bandeja de entrada y spam.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    })();
  };

  if (emailSent) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <AuthCard
          title="Correo enviado"
          description="Hemos enviado un enlace de recuperación a tu correo electrónico"
        >
          <div className="space-y-4">
            <p className="body-sm text-muted-foreground text-center">
              Revisa tu bandeja de entrada y sigue las instrucciones para
              restablecer tu contraseña.
            </p>
            <p className="body-sm text-muted-foreground text-center">
              Si no recibes el correo en unos minutos, revisa tu carpeta de
              spam.
            </p>
            <FormFooter
              text="¿Recordaste tu contraseña?"
              linkText="Volver al inicio de sesión"
              linkTo="/login"
            />
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <AuthCard
        title="¿Olvidaste tu contraseña?"
        description="Ingresa tu correo electrónico y te enviaremos un enlace para recuperarla"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <FormInput
              id="email"
              label="Correo Electrónico"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-3">
              <AuthButton loading={loading}>Enviar enlace de recuperación</AuthButton>
            </div>
          </div>

          <FormFooter
            text="¿Recordaste tu contraseña?"
            linkText="Volver al inicio de sesión"
            linkTo="/login"
          />
        </form>
      </AuthCard>
    </div>
  );
}
