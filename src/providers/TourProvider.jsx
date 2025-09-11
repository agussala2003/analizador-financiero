// src/providers/TourProvider.jsx
import { useState, useCallback } from 'react';
import { logger } from '../lib/logger';
import { TourContext } from '../context/tourContext';

export function TourProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // ✅ SOLUCIÓN: Declaramos `endTour` primero
  const endTour = useCallback(() => {
    logger.info('GUIDED_TOUR_ENDED', { onStep: currentStepIndex });
    setIsActive(false);
    setTooltip(null);
    setCurrentStepIndex(0);
    setSteps([]);
  }, [currentStepIndex]);


  const calculatePosition = (element, placement = 'top', offset = 10) => {
    const rect = element.getBoundingClientRect();
    let x, y;
    switch (placement) {
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + offset;
        break;
      case 'left':
        x = rect.left - offset;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + offset;
        y = rect.top + rect.height / 2;
        break;
      default: // top
        x = rect.left + rect.width / 2;
        y = rect.top - offset;
        break;
    }
    setPosition({ x, y });
  };

  const showStep = useCallback((stepIndex, tourSteps) => {
    const step = tourSteps[stepIndex];
    if (!step) return;

    const element = document.querySelector(step.selector);
    if (!element) {
      logger.warn('TOUR_ELEMENT_NOT_FOUND', { selector: step.selector, stepIndex });
      if (stepIndex < tourSteps.length - 1) {
        // Llama recursivamente al siguiente paso
        showStep(stepIndex + 1, tourSteps);
        setCurrentStepIndex(stepIndex + 1);
      } else {
        endTour(); // <-- Ahora esto funciona porque `endTour` ya está definido
      }
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      calculatePosition(element, step.placement);
      setTooltip({
        element,
        placement: step.placement || 'top',
        content: {
          title: step.title,
          description: step.description,
          nextLabel: stepIndex >= tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'
        },
      });
    }, 500);
  }, [endTour]); // 👈 Añadimos `endTour` como dependencia


  const startTour = useCallback((tourSteps = []) => {
    if (tourSteps.length === 0) return;
    logger.info('GUIDED_TOUR_STARTED', { totalSteps: tourSteps.length });
    setSteps(tourSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
    showStep(0, tourSteps);
  }, [showStep]);


  const nextStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= steps.length) {
      endTour();
    } else {
      setCurrentStepIndex(nextIndex);
      showStep(nextIndex, steps);
    }
  }, [currentStepIndex, steps, showStep, endTour]);

  const skipTour = useCallback(() => {
    logger.info('GUIDED_TOUR_SKIPPED', { onStep: currentStepIndex });
    endTour();
  }, [currentStepIndex, endTour]);

  const value = {
    isActive,
    tooltip,
    position,
    startTour,
    nextStep,
    skipTour,
    endTour,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}