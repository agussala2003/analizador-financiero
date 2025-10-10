// src/features/auth/components/admin-route.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../hooks/use-auth';
import { LoadingScreen } from '../../../components/ui/loading-screen';

export const AdminRoute: React.FC = () => {
  const { user, profile, isLoaded } = useAuth();

  // Esperamos a que la sesión y el perfil del usuario estén cargados.
  if (!isLoaded || (user && !profile)) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // Si no hay usuario o el rol no es 'administrador', redirigimos al dashboard.
  if (!user || profile?.role !== 'administrador') {
    return <Navigate to="/dashboard" replace />;
  }

  // Si es administrador, permitimos el acceso.
  return <Outlet />;
};