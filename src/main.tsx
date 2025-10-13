// src/main.tsx

import React, { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';

import './index.css';
import App from './App.tsx';
import { AuthProvider } from './providers/auth-provider.tsx';
import { ConfigProvider } from './providers/config-provider.tsx';
import { DashboardProvider } from './providers/dashboard-provider.tsx';
import { PortfolioProvider } from './providers/portfolio-provider.tsx';
import { LoadingScreen } from './components/ui/loading-screen.tsx';
import { initPerformanceMonitoring } from './lib/performance.ts';

// Importación de los guardianes de rutas
import { ProtectedRoute } from './features/auth/components/protected-route.tsx';
import { GuestRoute } from './features/auth/components/guest-route.tsx';
import { AdminRoute } from './features/auth/components/admin-route.tsx';

// Lazy loading de páginas
const LoginPage = React.lazy(() => import('./features/auth/pages/login-page.tsx'));
const RegisterPage = React.lazy(() => import('./features/auth/pages/register-page.tsx'));
const ForgotPasswordPage = React.lazy(() => import('./features/auth/pages/forgot-password-page.tsx'));
const ResetPasswordPage = React.lazy(() => import('./features/auth/pages/reset-password-page.tsx'));
const InfoPage = React.lazy(() => import('./features/info/pages/info-page.tsx'));
const NotFoundPage = React.lazy(() => import('./features/not-found/pages/not-found-page.tsx'));
const DashboardPage = React.lazy(() => import('./features/dashboard/pages/dashboard-page.tsx'));
const AssetDetailPage = React.lazy(() => import('./features/asset-detail/pages/asset-detail-page.tsx'));
const PortfolioPage = React.lazy(() => import('./features/portfolio/pages/portfolio-page.tsx'));
const DividendsPage = React.lazy(() => import('./features/dividends/pages/dividends-page.tsx'));
const NewsPage = React.lazy(() => import('./features/news/pages/news-page.tsx'));
const ProfilePage = React.lazy(() => import('./features/profile/pages/profile-page.tsx'));
const RiskPremiumPage = React.lazy(() => import('./features/risk-premium/pages/risk-premium-page.tsx'));
const SuggestionsPage = React.lazy(() => import('./features/suggestions/pages/suggestion-page.tsx'));
const AdminPage = React.lazy(() => import('./features/admin/pages/admin-page.tsx'));
const RetirementCalculatorPage = React.lazy(() => import('./features/retirement/pages/retirement-calculator-page.tsx'));

const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            // --- Ruta Pública General ---
            { index: true, element: <Suspense fallback={<LoadingScreen />}><InfoPage /></Suspense> },

            // --- Rutas solo para Invitados (no logueados) ---
            {
                element: <GuestRoute />,
                children: [
                    { path: "login", element: <Suspense fallback={<LoadingScreen />}><LoginPage /></Suspense> },
                    { path: "register", element: <Suspense fallback={<LoadingScreen />}><RegisterPage /></Suspense> },
                    { path: "forgot-password", element: <Suspense fallback={<LoadingScreen />}><ForgotPasswordPage /></Suspense> },
                    { path: "reset-password", element: <Suspense fallback={<LoadingScreen />}><ResetPasswordPage /></Suspense> },
                ]
            },

            // --- Rutas Protegidas para Usuarios Autenticados ---
            {
                element: <ProtectedRoute />,
                children: [
                    { path: "dashboard", element: <Suspense fallback={<LoadingScreen />}><DashboardPage /></Suspense> },
                    { path: "asset/:symbol", element: <Suspense fallback={<LoadingScreen />}><AssetDetailPage /></Suspense> },
                    { path: "portfolio", element: <Suspense fallback={<LoadingScreen />}><PortfolioPage /></Suspense> },
                    { path: "dividends", element: <Suspense fallback={<LoadingScreen />}><DividendsPage /></Suspense> },
                    { path: "news", element: <Suspense fallback={<LoadingScreen />}><NewsPage /></Suspense> },
                    { path: "profile", element: <Suspense fallback={<LoadingScreen />}><ProfilePage /></Suspense> },
                    { path: "risk-premium", element: <Suspense fallback={<LoadingScreen />}><RiskPremiumPage /></Suspense> },
                    { path: "suggestions", element: <Suspense fallback={<LoadingScreen />}><SuggestionsPage /></Suspense> },
                    { path: "retirement-calculator", element: <Suspense fallback={<LoadingScreen />}><RetirementCalculatorPage /></Suspense> },
                    
                    // --- Rutas Protegidas solo para Administradores (anidadas) ---
                    {
                        element: <AdminRoute />,
                        children: [
                            { path: "admin", element: <Suspense fallback={<LoadingScreen />}><AdminPage /></Suspense> },
                        ]
                    }
                ]
            },

            // --- Ruta de Not Found (al final) ---
            { path: '*', element: <Suspense fallback={<LoadingScreen />}><NotFoundPage /></Suspense> },
        ],
    },
]);

// Inicializar monitoreo de performance
initPerformanceMonitoring();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ConfigProvider>
                    <DashboardProvider>
                        <PortfolioProvider>
                            <RouterProvider router={router} />
                        </PortfolioProvider>
                    </DashboardProvider>
                </ConfigProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
);