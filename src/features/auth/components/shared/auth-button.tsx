// src/features/auth/components/shared/auth-button.tsx

import { Button } from '../../../../components/ui/button';

/**
 * Props para el componente AuthButton.
 * @property loading - Si está en estado de carga
 * @property loadingText - Texto a mostrar durante la carga
 * @property children - Texto del botón
 */
interface AuthButtonProps {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

/**
 * Botón reutilizable para formularios de autenticación.
 * Maneja el estado de carga automáticamente.
 * 
 * @example
 * ```tsx
 * <AuthButton loading={isLoading} loadingText="Cargando...">
 *   Iniciar Sesión
 * </AuthButton>
 * ```
 */
export function AuthButton({
  loading,
  loadingText = 'Cargando...',
  children,
}: AuthButtonProps) {
  return (
    <Button type="submit" disabled={loading} className="w-full">
      {loading ? loadingText : children}
    </Button>
  );
}
