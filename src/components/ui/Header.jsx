// src/components/ui/Header.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation} from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../lib/logger';
import XIcon from '../svg/x';
import BurgerIcon from '../svg/burguer';
import { useConfig } from '../../hooks/useConfig';
import { TourButton } from '../onboarding/TooltipSystem';

function Header() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const config = useConfig();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const role = (profile?.role || 'basico').toLowerCase();
  const isAdmin = role === 'administrador';

  const [usage, setUsage] = useState(0);

  const planLimit = config.plans.roleLimits[role] ? (role === 'administrador' ? Infinity : config.plans.roleLimits[role]) : 0;
  const remainingRaw = planLimit === Infinity ? Infinity : Math.max(planLimit - usage, 0);
  const remainingLabel = remainingRaw === Infinity ? '∞' : String(remainingRaw);

  const displayName = useMemo(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user?.email || '';
  }, [user, profile]);

  useEffect(() => {
    setUsage(Number(profile?.api_calls_made ?? 0));
  }, [profile?.api_calls_made]);

  const navLinkClass = ({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

  // ✅ CORRECCIÓN: Se elimina el useEffect complejo para 'onClickOutside'.
  // El cierre del menú ahora se maneja directamente por los clics en los botones
  // y por el cambio de ruta.

  // Este useEffect sí es útil: cierra el menú móvil cuando navegas a otra página.
  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false); // <-- AÑADIDO: También cerramos el menú de usuario al navegar.
  }, [location.pathname]);

  const initials = useMemo(() => {
    const email = user?.email || '';
    const local = email.split('@')[0] || '';
    const parts = local.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (local[0] || 'U').toUpperCase();
  }, [user?.email]);

  const handleSignOut = () => {
    logger.info('HEADER_SIGNOUT_CLICKED', 'Usuario cerrando sesión desde header', {
      userId: user?.id,
      userEmail: user?.email,
      currentPath: location.pathname
    });
    // ✅ CORRECCIÓN: Cerramos el menú explícitamente ANTES de llamar a signOut.
    setUserOpen(false);
    signOut();
  };
  
  const headerTourSteps = [
    {
      selector: '[data-tour="navigation"]',
      title: '🧭 Navegación Principal',
      description: 'Usa este menú para moverte entre las secciones principales de la aplicación.',
      placement: 'bottom'
    },
    {
      selector: '[data-tour="user-profile"]',
      title: '👤 Tu Perfil y Cuenta',
      description: 'Accede a tu perfil, gestiona tu plan y cierra sesión desde aquí.',
      placement: 'bottom'
    },
    {
      selector: '[data-tour="dashboard"]',
      title: '📊 Dashboard',
      description: 'Visualiza y analiza datos financieros personalizados en tu dashboard.',
      placement: 'bottom'
    },
    {
      selector: '[data-tour="latest-news"]',
      title: '📰 Últimas Noticias',
      description: 'Mantente informado sobre las últimas noticias del mercado y actualizaciones de la aplicación.',
      placement: 'bottom'
    },
    {
      selector: '[data-tour="our-blog"]',
      title: '📝 Nuestro Blog',
      description: 'Accede a artículos y recursos útiles sobre análisis de datos y finanzas.',
      placement: 'bottom'
    },
    {
      selector: '[data-tour="dividends"]',
      title: '💰 Seguimiento de Dividendos',
      description: 'Gestiona y realiza un seguimiento de tus ingresos por dividendos aquí.',
      placement: 'bottom'
    },
    {
      selector: '[data-tour="suggestions"]',
      title: '💡 Sugerencias y Feedback',
      description: '¿Tienes ideas para mejorar? Envíanos tus sugerencias y comentarios.',
      placement: 'bottom'
    },
    {
      selector: '[data-tour="help-button"]',
      title: '❓ Ayuda y Tours',
      description: 'Puedes reiniciar este tour o encontrar otros tours específicos en cada página desde botones como este.',
      placement: 'bottom'
    }
  ];

  return (
    <header className="bg-gray-800 text-white shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Contenedor Izquierdo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 md:hidden">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
                onClick={() => {
                  logger.info('HEADER_MOBILE_MENU_TOGGLED', 'Usuario abriendo/cerrando menú móvil', { isOpening: !mobileOpen });
                  setMobileOpen(v => !v);
                }}
              >
                {mobileOpen ? <XIcon className="h-6 w-6" /> : <BurgerIcon className="h-6 w-6" />}
              </button>
            </div>
            <nav className="hidden md:flex items-center space-x-2" data-tour="navigation">
              <NavLink to="/" className={navLinkClass} end>Información</NavLink>
              <NavLink data-tour="dashboard" to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              <NavLink data-tour="latest-news" to="/news" className={navLinkClass}>Noticias</NavLink>
              <NavLink data-tour="our-blog" to="/blogs" className={navLinkClass} end>Blogs</NavLink>
              <NavLink data-tour="dividends" to="/dividends" className={navLinkClass}>Dividendos</NavLink>
              <NavLink data-tour="suggestions" to="/suggestions" className={navLinkClass}>Sugerencias</NavLink>
              <NavLink to="/profile" className={navLinkClass}>Perfil</NavLink>
              {profile?.can_upload_blog && (<NavLink to="/blogs/my-posts" className={navLinkClass}>Mis Publicaciones</NavLink>)}
              {isAdmin && (<NavLink to="/admin" className={navLinkClass}>Admin</NavLink>)}
            </nav>
          </div>

          {/* Contenedor Derecho */}
          <div className="flex items-center space-x-4">
            <div className='hidden md:block' data-tour="help-button">
              <TourButton tourSteps={headerTourSteps} label="Ayuda" />
            </div>
            <div className="relative" data-tour="user-profile">
              <button
                onClick={() => {
                  logger.info('HEADER_USER_MENU_TOGGLED', 'Usuario abriendo/cerrando menú de usuario', { isOpening: !userOpen });
                  setUserOpen(v => !v);
                }}
                className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-gray-700 focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={userOpen}
              >
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold leading-4">{displayName}</span>
                  <span className="text-[11px] text-gray-300 leading-4 capitalize">Plan: {role}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-gray-600 grid place-items-center text-sm font-bold">{initials}</div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${userOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
              </button>

              {/* Dropdown */}
              {userOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg bg-white text-gray-900 shadow-lg ring-1 ring-black/5 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">Plan: {role}</p>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-3 text-center">
                    <Stat label="Límite" value={planLimit === Infinity ? '∞' : planLimit} />
                    <Stat label="Usadas" value={usage} />
                    <Stat label="Restantes" value={remainingLabel} strong />
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleSignOut} // ✅ CORRECCIÓN: Usamos el nuevo handler
                      className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menú mobile desplegable */}
        {mobileOpen && (
          <div className="md:hidden">
            <nav className="space-y-1 pb-4 pt-2">
              <MobileLink to="/" end>Información</MobileLink>
              <MobileLink to="/dashboard">Dashboard</MobileLink>
              <MobileLink to="/news">Noticias</MobileLink>
              <MobileLink to="/blogs" end>Blogs</MobileLink>
              <MobileLink to="/dividends">Dividendos</MobileLink>
              <MobileLink to="/suggestions">Sugerencias</MobileLink>
              <MobileLink to="/profile">Perfil</MobileLink>
              {profile?.can_upload_blog && (<MobileLink to="/blogs/my-posts">Mis Publicaciones</MobileLink>)}
              {isAdmin && (<MobileLink to="/admin">Admin</MobileLink>)}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

/** --- Helpers UI --- */

function Stat({ label, value, strong = false }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={`text-sm ${strong ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  );
}

function MobileLink({ to, end = false, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 text-base font-medium ${
          isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default React.memo(Header);