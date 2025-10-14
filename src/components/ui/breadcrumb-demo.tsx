import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { Link, useLocation } from "react-router-dom";
import React from "react";

// Mapeo de nombres amigables para rutas específicas
const friendlyNames: Record<string, string> = {
  "dashboard": "Dashboard",
  "portfolio": "Mi Portfolio",
  "watchlist": "Lista de Seguimiento",
  "dividends": "Calendario de Dividendos",
  "news": "Noticias",
  "profile": "Perfil",
  "risk-premium": "Prima de Riesgo",
  "suggestions": "Sugerencias",
  "retirement-calculator": "Calculadora de Retiro",
  "blog": "Blog",
  "crear": "Crear Artículo",
  "editar": "Editar Artículo",
  "mis-blogs": "Mis Artículos",
  "asset": "Activo",
  "auth": "Autenticación",
  "login": "Iniciar Sesión",
  "register": "Registrarse",
  "forgot-password": "Recuperar Contraseña",
  "reset-password": "Restablecer Contraseña",
};

// Rutas que NO son navegables (rutas intermedias sin página propia)
const nonNavigableRoutes = new Set([
  "/asset",      // Solo existe /asset/:symbol
  "/blog/crear", // Ruta final, no intermedia
  "/blog/editar", // Solo existe /blog/editar/:slug
]);

/**
 * Convierte kebab-case a Title Case
 * Ejemplo: "retirement-calculator" → "Retirement Calculator"
 */
function formatKebabCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Obtiene el nombre amigable para mostrar
 */
function getDisplayName(value: string): string {
  // Si existe en el mapeo, usarlo
  if (friendlyNames[value]) {
    return friendlyNames[value];
  }
  
  // Si contiene guiones, formatear como Title Case
  if (value.includes('-')) {
    return formatKebabCase(value);
  }
  
  // Si es todo mayúsculas (ej: NVDA), dejarlo así
  if (value === value.toUpperCase() && value.length <= 5) {
    return value;
  }
  
  // Por defecto: primera letra mayúscula
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Verifica si una ruta es navegable
 */
function isNavigable(path: string): boolean {
  return !nonNavigableRoutes.has(path);
}

export default function GenericBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) 
    return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Inicio</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const canNavigate = isNavigable(to);
          const displayName = getDisplayName(value);

          return (
            <React.Fragment key={to}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !canNavigate ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}