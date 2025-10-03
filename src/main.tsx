// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import App from './App.tsx'
import { AuthProvider } from './providers/auth-provider.tsx';
import LoginPage from './components/pages/login-page.tsx';
import RegisterPage from './components/pages/register-page.tsx';
import DividendsPage from './components/pages/dividends-page.tsx';
import { ConfigProvider } from './providers/config-provider.tsx';
import InfoPage from './components/pages/info-page.tsx';
import NotFoundPage from './components/pages/not-found-page.tsx';
import NewsPage from './components/pages/news-page.tsx';
import DashboardPage from './components/pages/dashboard-page.tsx';
import { DashboardProvider } from './providers/dashboard-provider.tsx';
import { PortfolioProvider } from './providers/portfolio-provider.tsx';
import ProfilePage from './components/pages/profile-page.tsx';
import RiskPremiumPage from './components/pages/risk-premium-page.tsx';
import AssetDetailPage from './components/pages/asset-detail-page.tsx';
import PortfolioPage from './components/pages/portfolio-page.tsx';
import SuggestionsPage from './components/pages/suggestion-page.tsx';
import AdminPage from './components/pages/admin-page.tsx';
import RetirementCalculatorPage from './components/pages/retirement-calculator-page.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App.tsx ahora es el Layout principal
    children: [
      { index: true, element: <InfoPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "asset/:symbol", element: <AssetDetailPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "dividends", element: <DividendsPage /> },
      { path: "news", element: <NewsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "risk-premium", element: <RiskPremiumPage /> },
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "suggestions", element: <SuggestionsPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "retirement-calculator", element: <RetirementCalculatorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ConfigProvider>
        <DashboardProvider>
          <PortfolioProvider>
            <RouterProvider router={router} />
          </PortfolioProvider>
        </DashboardProvider>
      </ConfigProvider>
    </AuthProvider>
  </StrictMode>,
)