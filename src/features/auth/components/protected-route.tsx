// src/features/auth/components/protected-route.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../hooks/use-auth';
import { LoadingScreen } from '../../../components/ui/loading-screen';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoaded } = useAuth();

  // Mientras se verifica la sesión, muestra una pantalla de carga.
  // Esto evita un parpadeo donde se muestra la página de login brevemente.
  if (!isLoaded) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  // Si no hay usuario y la verificación ha terminado, redirige a /login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderiza el contenido solicitado (la página protegida).
  // `children` se usa si pasas componentes directamente, `Outlet` para rutas anidadas.
  return children ? <>{children}</> : <Outlet />;
};