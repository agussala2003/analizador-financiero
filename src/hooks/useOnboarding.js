// src/hooks/useOnboarding.js
import { useState, useCallback, useEffect } from 'react';
import { logger } from '../lib/logger';

/**
 * Hook para gestión del sistema de onboarding
 */
export function useOnboarding(options = {}) {
  const {
    storageKey = 'onboarding_progress',
    autoStart = true,
    enableAnalytics = true
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [onboardingData, setOnboardingData] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState({
    type: null,
    interests: [],
    goals: []
  });

  // ✅ CORRECCIÓN: Cargar progreso del onboarding UNA SOLA VEZ al montar.
  // Se eliminó `userProfile` del array de dependencias para evitar el bucle infinito.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        setCompletedSteps(new Set(data.completedSteps || []));
        setOnboardingData(data.onboardingData || {});
        setIsCompleted(data.isCompleted || false);
        // Inicializamos el userProfile desde el guardado si existe
        setUserProfile(prevProfile => ({ ...prevProfile, ...(data.userProfile || {}) }));
        
        if (!data.isCompleted && !data.hasBeenShown && autoStart) {
          setIsActive(true);
          setCurrentStep(data.currentStep || 0);
        }
      } else if (autoStart) {
        setIsActive(true);
      }
    } catch (error) {
      logger.error('ONBOARDING_LOAD_ERROR', 'Error cargando progreso', { error: error.message });
    }
  }, [storageKey, autoStart]);


  // Guardar progreso
  const saveProgress = useCallback(() => {
    try {
      const data = {
        currentStep,
        completedSteps: Array.from(completedSteps),
        onboardingData,
        isCompleted,
        hasBeenShown: true,
        userProfile,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      logger.error('ONBOARDING_SAVE_ERROR', 'Error guardando progreso', { error: error.message });
    }
  }, [storageKey, currentStep, completedSteps, onboardingData, isCompleted, userProfile]);

  // Avanzar al siguiente paso
  const nextStep = useCallback((stepData = {}) => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setOnboardingData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);

    if (enableAnalytics) {
      logger.info('ONBOARDING_STEP_COMPLETED', `Paso ${currentStep} completado`);
    }
  }, [currentStep, enableAnalytics]);

  // Retroceder al paso anterior
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      if (enableAnalytics) {
        logger.info('ONBOARDING_STEP_BACK', `Retroceso a paso ${currentStep - 1}`);
      }
    }
  }, [currentStep, enableAnalytics]);

  // Saltar paso
  const skipStep = useCallback((reason = 'user_skip') => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => prev + 1);

    if (enableAnalytics) {
      logger.info('ONBOARDING_STEP_SKIPPED', `Paso ${currentStep} saltado`, { reason });
    }
  }, [currentStep, enableAnalytics]);

  // Ir a un paso específico
  const goToStep = useCallback((stepIndex) => {
    setCurrentStep(stepIndex);
  }, []);

  // Completar onboarding
  const completeOnboarding = useCallback((finalData = {}) => {
    setIsCompleted(true);
    setIsActive(false);
    setOnboardingData(prev => ({ ...prev, ...finalData }));
    
    if (enableAnalytics) {
      logger.info('ONBOARDING_COMPLETED', 'Onboarding completado', { userProfile });
    }
  }, [userProfile, enableAnalytics]);

  // Cerrar onboarding permanentemente
  const dismissOnboarding = useCallback(() => {
    setIsActive(false);
    const data = {
      currentStep,
      completedSteps: Array.from(completedSteps),
      onboardingData,
      isCompleted: false,
      hasBeenShown: true,
      userProfile,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    if (enableAnalytics) {
      logger.info('ONBOARDING_DISMISSED', 'Onboarding cerrado sin completar');
    }
  }, [storageKey, currentStep, completedSteps, onboardingData, userProfile, enableAnalytics]);

  // Reiniciar onboarding
  const resetOnboarding = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setOnboardingData({});
    setIsCompleted(false);
    localStorage.removeItem(storageKey);
    if (enableAnalytics) {
      logger.info('ONBOARDING_RESET', 'Onboarding reiniciado');
    }
  }, [storageKey, enableAnalytics]);

  // Actualizar perfil de usuario
  const updateUserProfile = useCallback((updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    // El log aquí puede ser muy ruidoso, es mejor que se loguee al final
  }, []);

  // Pausar/reanudar onboarding
  const pauseOnboarding = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeOnboarding = useCallback(() => {
    setIsActive(true);
  }, []);

  // Guardar progreso automáticamente cuando algo relevante cambia
  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  return {
    isActive,
    currentStep,
    isCompleted,
    userProfile,
    nextStep,
    previousStep,
    skipStep,
    goToStep,
    completeOnboarding,
    dismissOnboarding,
    resetOnboarding,
    updateUserProfile,
    pauseOnboarding,
    resumeOnboarding,
    canGoBack: currentStep > 0,
  };
}


/**
 * Hook especializado para onboarding financiero
 */
export function useFinancialOnboarding() {
  const onboarding = useOnboarding({
    storageKey: 'financial_onboarding',
    autoStart: true,
    enableAnalytics: true
  });

  const steps = [
    { id: 'welcome', title: '¡Bienvenido!', description: 'Te ayudaremos a configurar tu experiencia.', type: 'intro', component: 'WelcomeStep' },
    { id: 'user_type', title: '¿Cuál es tu nivel?', description: 'Esto nos ayuda a personalizar tu dashboard.', type: 'selection', component: 'UserTypeStep', options: [ { value: 'beginner', label: 'Principiante', description: 'Nuevo en inversiones' }, { value: 'intermediate', label: 'Intermedio', description: 'Con algo de experiencia' }, { value: 'advanced', label: 'Avanzado', description: 'Inversor experimentado' } ] },
    { id: 'interests', title: '¿Qué te interesa más?', description: 'Selecciona todas las que apliquen.', type: 'multiselect', component: 'InterestsStep', options: [ { value: 'stocks', label: 'Acciones', icon: '📈' }, { value: 'crypto', label: 'Criptomonedas', icon: '₿' }, { value: 'news', label: 'Noticias', icon: '📰' }, { value: 'analysis', label: 'Análisis', icon: '📊' }, { value: 'dividends', label: 'Dividendos', icon: '💰' }, { value: 'portfolio', label: 'Portafolio', icon: '📁' } ] },
    { id: 'goals', title: '¿Cuáles son tus objetivos?', description: 'Esto nos ayuda a mostrarte contenido relevante.', type: 'multiselect', component: 'GoalsStep', options: [ { value: 'learn', label: 'Aprender sobre inversiones', icon: '🎓' }, { value: 'invest', label: 'Comenzar a invertir', icon: '💼' }, { value: 'track', label: 'Seguir mis inversiones', icon: '👀' }, { value: 'analyze', label: 'Analizar mercados', icon: '🔍' } ] },
    { id: 'dashboard_tour', title: 'Tour del Dashboard', description: 'Un rápido vistazo a las funciones principales.', type: 'interactive', component: 'DashboardTourStep' },
    { id: 'features', title: 'Funciones Clave', description: 'Conoce lo que puedes hacer en la plataforma.', type: 'showcase', component: 'FeaturesStep', features: [ { id: 'search', title: 'Búsqueda Inteligente', description: 'Encuentra acciones, noticias y más' }, { id: 'portfolio', title: 'Portafolio Personalizado', description: 'Gestiona y sigue tus inversiones' }, { id: 'alerts', title: 'Alertas en Tiempo Real', description: 'Recibe notificaciones importantes al instante' } ] },
    { id: 'completion', title: '¡Todo listo!', description: 'Tu cuenta está configurada y lista para usar.', type: 'completion', component: 'CompletionStep' }
  ];

  const getCurrentStepData = () => {
    return steps[onboarding.currentStep] || null;
  };

  const canContinue = () => {
    const currentStepData = getCurrentStepData();
    if (!currentStepData) return false;

    switch (currentStepData.id) {
      case 'user_type':
        return !!onboarding.userProfile.type;
      case 'interests':
        return onboarding.userProfile.interests.length > 0;
      case 'goals':
        return onboarding.userProfile.goals.length > 0;
      default:
        return true;
    }
  };

  const completeCurrentStep = (stepData = {}) => {
    if (!canContinue()) return false;
    if (onboarding.currentStep >= steps.length - 1) {
      onboarding.completeOnboarding(stepData);
    } else {
      onboarding.nextStep(stepData);
    }
    return true;
  };

  return {
    ...onboarding,
    steps,
    getCurrentStepData,
    canContinue,
    completeCurrentStep,
    totalSteps: steps.length,
    progressPercentage: Math.round(((onboarding.currentStep) / (steps.length -1)) * 100)
  };
}

export default useOnboarding;