// src/components/ui/Header.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import { logger } from '../../lib/logger';
import { TourButton } from '../onboarding/TooltipSystem';

// --- Iconos SVG (pequeños componentes para limpieza) ---
const XIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const BurgerIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ChevronDownIcon = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>;
const BellIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

// --- Hook Personalizado para detectar clicks fuera ---
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

/**
 * ✅ NUEVO: Componente reutilizable para menús de navegación
 */
function NavDropdown({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const location = useLocation();
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white inline-flex items-center gap-1"
      >
        <span>{title}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

const DropdownNavLink = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-4 py-2 text-sm ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`
    }
  >
    {children}
  </NavLink>
);

/**
 * ✅ NUEVO: Componente para la campana de notificaciones
 */
function Notifications() {
  const config = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  
  useClickOutside(notificationRef, () => setIsOpen(false));

  useEffect(() => {
    const activeNotifications = config.notifications || [];
    const readNotifications = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    setNotifications(activeNotifications.filter(n => !readNotifications.includes(n.id)));
  }, [config.notifications]);

  const markAsRead = (id) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    
    const readNotifications = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    localStorage.setItem('read_notifications', JSON.stringify([...readNotifications, id]));
    
    if (updatedNotifications.length === 0) {
      setIsOpen(false);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="relative" ref={notificationRef}>
      <button onClick={() => setIsOpen(v => !v)} className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700">
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-gray-800" />
        )}
      </button>
      {isOpen && (
        // ✅ CAMBIO: Clases responsivas para el menú desplegable
        <div 
          className="absolute right-0 md:right-0 mt-2 w-fit max-w-sm md:w-80 origin-top-right rounded-lg bg-white text-gray-900 shadow-lg ring-1 ring-black/5 z-50 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0"
        >
          <div className="p-3 border-b font-semibold">
            Notificaciones
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map(notification => (
              <div key={notification.id} className="p-3 border-b hover:bg-gray-50">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-xs text-gray-600 mb-2">{notification.description}</p>
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Marcar como leído
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Componente Principal del Header ---
function Header() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const config = useConfig();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const userMenuRef = useRef(null);
  useClickOutside(userMenuRef, () => setUserOpen(false));

  const role = useMemo(() => (profile?.role || 'basico').toLowerCase(), [profile]);
  const isAdmin = role === 'administrador';

  const usage = useMemo(() => Number(profile?.api_calls_made ?? 0), [profile]);
  const planLimit = useMemo(() => config.plans.roleLimits[role] ?? 0, [config, role]);
  const remainingLabel = useMemo(() => {
    if (planLimit === Infinity) return '∞';
    return String(Math.max(planLimit - usage, 0));
  }, [planLimit, usage]);
  
  const displayName = useMemo(() => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
    if (profile?.first_name) return profile.first_name;
    return user?.email || '';
  }, [user, profile]);

  const initials = useMemo(() => {
    const email = user?.email || '';
    const local = email.split('@')[0] || '';
    const parts = local.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (local[0] || 'U').toUpperCase();
  }, [user?.email]);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      logger.error('HEADER_SIGNOUT_ERROR', 'Error en header al cerrar sesión', { error: error.message });
    }
  }, [isSigningOut, signOut]);
  
  const navLinkClass = ({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

  // Estructura de navegación
  const navLinks = {
    tools: [
      { to: "/dashboard", label: "Dashboard", tourId: "dashboard" },
      { to: "/profile", label: "Portafolio", tourId: "portfolio" },
      { to: "/dividends", label: "Dividendos", tourId: "dividends" },
    ],
    content: [
      { to: "/news", label: "Noticias", tourId: "latest-news" },
      { to: "/blogs", label: "Blogs", tourId: "our-blog" },
      { to: "/blogs/my-bookmarks", label: "Mis Favoritos" }, 
      ...(profile?.can_upload_blog ? [{ to: "/blogs/my-posts", label: "Mis Publicaciones" }] : []),
    ],
    single: [
      { to: "/suggestions", label: "Sugerencias", tourId: "suggestions" },
    ],
    admin: isAdmin ? [{ to: "/admin", label: "Admin" }] : [],
  };

  return (
    <header className="bg-gray-800 text-white shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Contenedor Izquierdo: Menú Móvil y Navegación */}
          <div className="flex items-center">
            <div className="flex-shrink-0 md:hidden">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
                onClick={() => setMobileOpen(v => !v)}
              >
                {mobileOpen ? <XIcon className="h-6 w-6" /> : <BurgerIcon className="h-6 w-6" />}
              </button>
            </div>
            
            <nav className="hidden md:flex items-center space-x-2" data-tour="navigation">
              <NavLink to="/" className={navLinkClass} end>Información</NavLink>
              
              <NavDropdown title="Herramientas">
                {navLinks.tools.map(link => <DropdownNavLink key={link.to} to={link.to}>{link.label}</DropdownNavLink>)}
              </NavDropdown>

              <NavDropdown title="Contenido">
                {navLinks.content.map(link => <DropdownNavLink key={link.to} to={link.to}>{link.label}</DropdownNavLink>)}
              </NavDropdown>
              
              {navLinks.single.map(link => <NavLink key={link.to} data-tour={link.tourId} to={link.to} className={navLinkClass}>{link.label}</NavLink>)}
              {navLinks.admin.map(link => <NavLink key={link.to} to={link.to} className={navLinkClass}>{link.label}</NavLink>)}
            </nav>
          </div>

          {/* Contenedor Derecho: Notificaciones, Ayuda y Menú de Usuario */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Notifications /> {/* ✅ Componente de notificaciones añadido aquí */}

            <div className='hidden md:block' data-tour="help-button">
              <TourButton className='md:cursor-pointer' tourSteps={[]} label="Ayuda" />
            </div>

            <div className="relative" data-tour="user-profile" ref={userMenuRef}>
              <button
                onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-gray-700 focus:outline-none"
              >
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold leading-4">{displayName}</span>
                  <span className="text-[11px] text-gray-300 leading-4 capitalize">Plan: {role}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-gray-600 grid place-items-center text-sm font-bold">{initials}</div>
                <ChevronDownIcon className={`hidden sm:block h-4 w-4 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg bg-white text-gray-900 shadow-lg ring-1 ring-black/5 z-[9999]">
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
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-white text-sm font-medium ${isSigningOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}
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
              {[...navLinks.tools, ...navLinks.content, ...navLinks.single, ...navLinks.admin].map(link => (
                <MobileLink key={link.to} to={link.to}>{link.label}</MobileLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// --- Componentes Helper ---
const Stat = ({ label, value, strong = false }) => (
  <div className="rounded-md bg-gray-50 px-3 py-2">
    <p className="text-[11px] text-gray-500">{label}</p>
    <p className={`text-sm ${strong ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{value}</p>
  </div>
);

const MobileLink = ({ to, end = false, children }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `block rounded-md px-3 py-2 text-base font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
  >
    {children}
  </NavLink>
);

export default React.memo(Header);