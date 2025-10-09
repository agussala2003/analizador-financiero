// src/hooks/use-auth.ts

import { useContext } from "react";
import { AuthContext } from "../providers/auth-provider";
import { AuthContextType } from "../types/auth";

/**
 * Hook personalizado para acceder al contexto de autenticación.
 * Proporciona acceso a la sesión, usuario, perfil y funciones de autenticación.
 * * @throws {Error} Si se utiliza fuera de un `AuthProvider`.
 * @returns {AuthContextType} El valor completo del contexto de autenticación.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  // La comprobación `context === undefined` ya no es estrictamente necesaria
  // si el contexto se inicializó con un valor que lanza un error,
  // pero es una buena práctica mantenerla como una segunda capa de seguridad.
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};