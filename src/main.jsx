// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Providers y Lógica
import { AuthProvider } from './providers/AuthProvider.jsx';
import { DashboardProvider } from './providers/DashboardProvider.jsx';
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
import { ConfigProvider } from './providers/ConfigProvider.jsx';
import BlogsPage from './pages/BlogsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BlogPostPage from './pages/BlogsPostPage.jsx';
import CreateBlogPage from './pages/CreateBlogPage.jsx';
import MyPostsPage from './pages/MyPostsPage.jsx';
import EditBlogPage from './pages/EditBlogPage.jsx';
import ErrorProvider from './providers/ErrorProvider.jsx';
import { PortfolioProvider } from './providers/PortfolioProvider.jsx';
import MyBookmarksPage from './pages/MyBookmarksPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/login', element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: '/register', element: <PublicRoute><RegisterPage /></PublicRoute> },
      { path: '/forgot-password', element: <PublicRoute><ForgotPasswordPage /></PublicRoute> },
      { path: '/update-password', element: <UpdatePasswordPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { index: true, element: <InfoPage /> },
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'blogs', element:  <ProtectedRoute><BlogsPage /></ProtectedRoute> },
      { path: 'blogs/:slug', element: <BlogPostPage /> },
      { path: 'blogs/create', element: <ProtectedRoute><CreateBlogPage /></ProtectedRoute> },
      { path: 'blogs/my-posts', element: <ProtectedRoute><MyPostsPage /></ProtectedRoute> },
      { path: 'blogs/edit/:slug', element: <ProtectedRoute><EditBlogPage /></ProtectedRoute> },
      { path: 'blogs/my-bookmarks', element: <ProtectedRoute><MyBookmarksPage /></ProtectedRoute> },
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
    <ConfigProvider>
      <ErrorProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <DashboardProvider>
              <PortfolioProvider>
                <RouterProvider router={router} />
                <AppErrorBridge />
                <ErrorModal />
              </PortfolioProvider>
            </DashboardProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </ErrorProvider>
    </ConfigProvider>
  </React.StrictMode>
);