// src/utils/sidebar-visibility.ts

import { User } from "@supabase/supabase-js";
import { Profile } from "../types/auth";
import { SidebarLink } from "../types/config";

/**
 * Determina si un enlace de la barra lateral debe ser visible para el usuario actual.
 * @param link - El objeto del enlace a verificar.
 * @param user - El objeto de usuario autenticado (o null).
 * @param profile - El perfil del usuario (o null).
 * @returns {boolean} - `true` si el enlace debe mostrarse, `false` en caso contrario.
 */
export const isLinkVisible = (link: SidebarLink, user: User | null, profile: Profile | null): boolean => {
  // Si el enlace no requiere autenticación, siempre es visible.
  if (!link.requiresAuth) {
    return true;
  }
  // Si requiere autenticación pero no hay usuario, no es visible.
  if (link.requiresAuth && !user) {
    return false;
  }
  // Si requiere un rol específico y el usuario no lo tiene, no es visible.
  if (link.requiresRole && profile?.role.toLowerCase() !== link.requiresRole.toLowerCase()) {
    return false;
  }
  // Si requiere un permiso específico y el perfil del usuario no lo tiene, no es visible.
  if (link.requiresPermission && !profile?.[link.requiresPermission]) {
    return false;
  }
  // Si pasa todas las validaciones, es visible.
  return true;
};