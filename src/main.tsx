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


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App.tsx ahora es el Layout principal
    children: [
      { index: true, element: <InfoPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "dividends", element: <DividendsPage /> },
      { path: "news", element: <NewsPage /> },
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