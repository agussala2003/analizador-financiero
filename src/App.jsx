// src/App.jsx
import { Outlet } from 'react-router-dom';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ContextualTooltip } from './components/onboarding/TooltipSystem';
import { TourProvider } from './providers/TourProvider';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Outlet />
      <OnboardingModal />
      <ContextualTooltip />
    </div>
  );
}

export default function App() {
  return (
      <TourProvider> {/* 👈 Envuelve AppContent con el TourProvider */}
        <AppContent />
      </TourProvider>
  );
}