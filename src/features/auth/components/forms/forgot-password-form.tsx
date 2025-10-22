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
 * Formulario para solicitar enlace de acceso único.
 * Envía un email con un link mágico para acceder sin contraseña.
 * 
 * Incluye:
 * - Explicación del funcionamiento del enlace único
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
          title="¡Correo enviado!"
          description="Te hemos enviado un enlace de acceso único"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
              <p className="text-sm font-medium text-primary mb-2">
                📧 Revisa tu correo electrónico
              </p>
              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace de acceso único a <strong>{email}</strong>. 
                Al hacer clic en el enlace, accederás automáticamente a tu cuenta sin necesidad de cambiar la contraseña.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                ⏱️ El enlace expirará en 1 hora por seguridad
              </p>
              <p className="text-xs text-muted-foreground">
                📁 Si no ves el correo, revisa tu carpeta de spam
              </p>
              <p className="text-xs text-muted-foreground">
                🔒 Solo podrás usar este enlace una vez
              </p>
            </div>
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
        title="Acceso por enlace único"
        description="Te enviaremos un enlace mágico para acceder sin contraseña"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>¿Cómo funciona?</strong> Recibirás un correo con un enlace de acceso único. 
                Al hacer clic, entrarás directamente a tu cuenta sin necesidad de contraseña.
              </p>
            </div>

            <FormInput
              id="email"
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-3">
              <AuthButton loading={loading}>Enviar enlace de acceso</AuthButton>
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
