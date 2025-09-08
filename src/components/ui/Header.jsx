// src/components/Header.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import XIcon from '../svg/x';
import BurgerIcon from '../svg/burguer';
import { useConfig } from '../../context/ConfigContext';

function Header() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const config = useConfig();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const role = (profile?.role || 'basico').toLowerCase();
  const isAdmin = role === 'administrador';
  const isNotBasic = role !== 'basico';

  const [usage, setUsage] = useState(0);

  const planLimit = config.plans.roleLimits[role] ? (role === 'administrador' ? Infinity : config.plans.roleLimits[role]) : 0;

  const remainingRaw = planLimit === Infinity ? Infinity : Math.max(planLimit - usage, 0);

  const remainingLabel = remainingRaw === Infinity ? '∞' : String(remainingRaw);

  // Sincroniza cuando cambie el perfil desde el backend
  useEffect(() => {
    setUsage(Number(profile?.api_calls_made ?? 0));
  }, [profile?.api_calls_made]);

  // ---- UX: clases de NavLink, cierre en navegación, click afuera, ESC ----
  const navLinkClass = ({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Cerrar menús al click afuera / tecla Esc
  useEffect(() => {
    function onClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        // el botón hamburguesa maneja su propio toggle
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') {
        setUserOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials = useMemo(() => {
    const email = user?.email || '';
    const local = email.split('@')[0] || '';
    const parts = local.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (local[0] || 'U').toUpperCase();
  }, [user?.email]);

  return (
    <header className="bg-gray-800 text-white shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Izquierda: brand + nav (desktop) */}
          <div className="flex items-center gap-2">
            {/* Botón hamburguesa (mobile) */}
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white md:hidden"
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? ( <XIcon className="h-6 w-6" /> ) : ( <BurgerIcon className="h-6 w-6" /> )}
            </button>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavLink to="/" className={navLinkClass} end>
                Información
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/news" className={navLinkClass}>
                Noticias
              </NavLink>
              <NavLink to="/dividends" className={navLinkClass}>
                Dividendos
              </NavLink>
              <NavLink to="/suggestions" className={navLinkClass}>
                Sugerencias
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </nav>
          </div>

          {/* Derecha: sección usuario */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserOpen(v => !v)}
              className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-gray-700 focus:outline-none "
              aria-haspopup="menu"
              aria-expanded={userOpen}
            >
              {/* Email + plan (oculto en xs) */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold leading-4">
                  {user?.email}
                </span>
                <span className="text-[11px] text-gray-300 leading-4 capitalize">
                  Plan: {role}
                </span>
              </div>

              {/* Avatar circular con iniciales */}
              <div className="h-9 w-9 rounded-full bg-gray-600 grid place-items-center text-sm font-bold">
                {initials}
              </div>

              {/* Chevron */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${userOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            {userOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg bg-white text-gray-900 shadow-lg ring-1 ring-black/5 z-50"
              >
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
                    onClick={signOut}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú mobile desplegable */}
        {mobileOpen && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <nav className="space-y-1 pb-4 pt-2">
              <MobileLink to="/" end>
                Información
              </MobileLink>
              <MobileLink to="/dashboard">
                Dashboard
              </MobileLink>
              <MobileLink to="/news">
                Noticias
              </MobileLink>
              <MobileLink to="/dividends">
                Dividendos
              </MobileLink>
              <MobileLink to="/suggestions">
                Sugerencias
              </MobileLink>
              <MobileLink to="/info">
                Información
              </MobileLink>

              {isAdmin && (
                <MobileLink to="/admin">
                  Admin
                </MobileLink>
              )}
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