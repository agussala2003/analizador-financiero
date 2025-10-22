// src/features/auth/components/forms/reset-password-form.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../../../lib/utils';
import { AuthCard } from '../shared/auth-card';
import { Button } from '../../../../components/ui/button';
import { supabase } from '../../../../lib/supabase';

/**
 * Props para el componente ResetPasswordForm.
 * @property className - Clases CSS adicionales
 */
interface ResetPasswordFormProps extends React.ComponentProps<'div'> {
  className?: string;
}

/**
 * Componente de recuperación de contraseña mediante enlace único.
 * Verifica si hay una sesión de recovery activa y redirige al dashboard.
 * Si el token es inválido, muestra un mensaje de error.
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
  const [invalidToken, setInvalidToken] = React.useState<boolean | null>(null); // null = checking
  const navigate = useNavigate();

  // Verificar si hay una sesión de recovery activa
  React.useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setInvalidToken(true);
          toast.error('Link de acceso inválido o expirado');
          return;
        }

        if (session?.user) {
          // Sesión válida - redirigir al dashboard
          toast.success('¡Bienvenido de vuelta!', {
            description: 'Acceso concedido. Redirigiendo al dashboard...',
          });
          setTimeout(() => {
            void navigate('/dashboard');
          }, 1500);
        } else {
          setInvalidToken(true);
          toast.error('Link de acceso inválido o expirado');
        }
      } catch (err) {
        console.error('Error al verificar sesión:', err);
        setInvalidToken(true);
        toast.error('Error al verificar el link de acceso');
      }
    };

    void checkRecoverySession();
  }, [navigate]);

  // Mientras se verifica la sesión, mostrar loading
  if (invalidToken === null) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <AuthCard
          title="Verificando acceso..."
          description="Estamos validando tu link de recuperación"
        >
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">
              Esto solo tomará un momento
            </p>
          </div>
        </AuthCard>
      </div>
    );
  }

  // Si el token es inválido, mostrar mensaje de error
  if (invalidToken) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <AuthCard
          title="Link expirado o inválido"
          description="No pudimos verificar tu identidad con este link"
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm text-destructive">
                Este link de recuperación ya no es válido. Puede haber expirado o ya fue utilizado.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Por favor, solicita un nuevo link de recuperación para acceder a tu cuenta.
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

  return null;
}
