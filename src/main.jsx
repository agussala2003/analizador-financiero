// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Providers y Lógica
import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { ErrorProvider } from './context/ErrorContext.jsx';
import ErrorModal from './components/ui/ErrorModal.jsx';

// Páginas y Layouts
import App from './App.jsx'; // Nuestro layout principal
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import UpdatePasswordPage from './pages/UpdatePasswordPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import SuggestionsPage from './pages/SuggestionPage.jsx';
import DividendosPage from './pages/DividendosPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import PublicRoute from './components/protected/PublicRoute.jsx';
import ProtectedRoute from './components/protected/ProtectedRoute.jsx';
import AdminProtectedRoute from './components/protected/AdminProtectedRoute.jsx';
import AppErrorBoundary, { AppErrorBridge } from './components/protected/AppErrorBoundary.jsx';
import InfoPage from './pages/InfoPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ConfigProvider } from './context/ConfigContext.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App.jsx ahora es el layout que envuelve a TODAS las rutas hijas
    children: [
      // --- Rutas Públicas (solo para visitantes) ---
      { path: '/login', element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: '/register', element: <PublicRoute><RegisterPage /></PublicRoute> },
      { path: '/forgot-password', element: <PublicRoute><ForgotPasswordPage /></PublicRoute> },
      { path: '/update-password', element: <UpdatePasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },

      // --- Rutas Privadas (solo para usuarios logueados) ---
      { index: true, element: <InfoPage /> }, // Página de información pública como principal
      { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute><AdminProtectedRoute><AdminPage /></AdminProtectedRoute></ProtectedRoute> },
      { path: 'news', element: <ProtectedRoute><NewsPage /></ProtectedRoute> },
      { path: 'suggestions', element: <ProtectedRoute><SuggestionsPage /></ProtectedRoute> },
      { path: 'dividends', element: <ProtectedRoute><DividendosPage /></ProtectedRoute> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
    <ConfigProvider> {/* 👈 Envolver aquí */}
      <ErrorProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <DashboardProvider>
              <RouterProvider router={router} />
              <AppErrorBridge />
              <ErrorModal />
            </DashboardProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </ErrorProvider>
    </ConfigProvider> {/* 👈 Cerrar aquí */}
    </HelmetProvider>
  </React.StrictMode>
);