// src/features/auth/components/shared/auth-card.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';

/**
 * Props para el componente AuthCard.
 * @property title - Título de la tarjeta
 * @property description - Descripción bajo el título
 * @property children - Contenido de la tarjeta (formulario)
 */
interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Tarjeta reutilizable para formularios de autenticación.
 * Proporciona un diseño consistente con título, descripción y contenido.
 * 
 * @example
 * ```tsx
 * <AuthCard title="Iniciar sesión" description="Ingresa tus credenciales">
 *   <form>...</form>
 * </AuthCard>
 * ```
 */
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
