// src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { CombinedProvider } from './providers/AppProviders';
import { NotificationContainer } from './components/ui/NotificationSystem';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ContextualTooltip } from './components/onboarding/TooltipSystem';
import { logger } from './lib/logger';
import { TourProvider } from './providers/TourProvider';
import { useUser } from './hooks/useUser';

function AppContent() {
  const { loading, onboardingCompleted } = useUser();

  React.useEffect(() => {
    logger.info('APP_MOUNTED', 'Aplicación principal montada', {
      timestamp: new Date().toISOString(),
      onboardingCompleted
    });
  }, [onboardingCompleted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Outlet />
      
      {/* Sistemas globales */}
      <NotificationContainer />
      <OnboardingModal />
      <ContextualTooltip />
    </div>
  );
}

export default function App() {
  return (
    <CombinedProvider>
      <TourProvider> {/* 👈 Envuelve AppContent con el TourProvider */}
        <AppContent />
      </TourProvider>
    </CombinedProvider>
  );
}