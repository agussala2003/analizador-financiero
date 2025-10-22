// src/features/auth/components/forms/reset-password-form.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { AuthCard } from '../shared/auth-card';
import { FormInput } from '../shared/form-input';
import { AuthButton } from '../shared/auth-button';
import { Button } from '../../../../components/ui/button';
import { updatePassword, validatePassword } from '../../lib/auth-utils';
import { supabase } from '../../../../lib/supabase';

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
  const [invalidToken, setInvalidToken] = React.useState(false);
  const navigate = useNavigate();

  // Verificar si hay un token de recovery en la URL
  React.useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    // Validar token de recovery
    if (type === 'recovery' && accessToken) {
      // ✅ Token válido detectado - permitir mostrar formulario
      console.log('Sesión de recuperación activa detectada.');
      console.log('Token type:', type);
      console.log('Access token presente:', !!accessToken);
      setInvalidToken(false); // Explícitamente marcar como válido
    } else {
      // ❌ Token inválido o faltante - mostrar error
      console.warn('Token de recuperación inválido o faltante.');
      console.warn('Token type:', type);
      console.warn('Access token presente:', !!accessToken);
      setInvalidToken(true);
      toast.error('Link de recuperación inválido o expirado.');
    }
  }, []);

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
        
        // Cerrar sesión inmediatamente después de cambiar la contraseña
        await supabase.auth.signOut();
        
        // Informar al usuario que debe iniciar sesión con la nueva contraseña
        toast.info('Por favor, inicie sesión con su nueva contraseña');
        
        setTimeout(() => {
          void navigate('/login');
        }, 1000);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    })();
  };

  // Si el token es inválido, mostrar mensaje de error
  if (invalidToken) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <AuthCard
          title="Link inválido"
          description="El link de recuperación es inválido o ha expirado"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Por favor, solicita un nuevo link de recuperación de contraseña.
            </p>
            <Button 
              onClick={() => void navigate('/forgot-password')}
              className="w-full"
            >
              Solicitar nuevo link
            </Button>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Banner de advertencia de sesión temporal */}
      <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-900/10 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-amber-900 dark:text-amber-100">
              Sesión temporal activa
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Esta sesión es temporal y solo permite cambiar su contraseña. 
              Después de actualizar su contraseña, se cerrará automáticamente 
              la sesión y deberá iniciar sesión nuevamente con sus nuevas credenciales.
            </p>
          </div>
        </div>
      </div>

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
