// src/features/auth/components/forms/reset-password-form.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../../../lib/utils';
import { AuthCard } from '../shared/auth-card';
import { FormInput } from '../shared/form-input';
import { AuthButton } from '../shared/auth-button';
import { updatePassword, validatePassword } from '../../lib/auth-utils';

/**
 * Props para el componente ResetPasswordForm.
 * @property className - Clases CSS adicionales
 */
interface ResetPasswordFormProps extends React.ComponentProps<'div'> {
  className?: string;
}

/**
 * Formulario para restablecer contraseña.
 * Permite al usuario establecer una nueva contraseña después de recibir
 * el link de recuperación por email.
 * 
 * Incluye:
 * - Campo de nueva contraseña
 * - Campo de confirmación de contraseña
 * - Validación de coincidencia
 * - Botón de submit
 * 
 * @example
 * ```tsx
 * <ResetPasswordForm />
 * ```
 */
export function ResetPasswordForm({
  className,
  ...props
}: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    // Validar formato de contraseña
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error(validation.error ?? 'Contraseña inválida');
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        const result = await updatePassword(password);

        if (!result.success) {
          toast.error('Error al actualizar la contraseña. Intenta nuevamente.');
          return;
        }

        toast.success('Contraseña actualizada correctamente.');
        setTimeout(() => {
          void navigate('/login');
        }, 1000);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    })();
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <AuthCard
        title="Restablecer contraseña"
        description="Ingresa tu nueva contraseña a continuación"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <FormInput
              id="password"
              label="Nueva Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="new-password"
            />

            <FormInput
              id="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              autoComplete="new-password"
            />

            <div className="caption text-muted-foreground">
              <p>La contraseña debe tener al menos 6 caracteres.</p>
            </div>

            <div className="flex flex-col gap-3">
              <AuthButton loading={loading}>Actualizar Contraseña</AuthButton>
            </div>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
