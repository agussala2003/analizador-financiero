// src/hooks/useOnboarding.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

/**
 * Hook para gestión del sistema de onboarding
 */
export function useOnboarding(options = {}) {
  const { autoStart = true, enableAnalytics = true } = options;
  const { user, profile, refreshProfile } = useAuth();

  // ✅ SOLUCIÓN: Función robusta para inicializar el perfil del onboarding.
  // Esto asegura que `interests` y `goals` sean siempre arrays,
  // incluso si los datos guardados en la base de datos están incompletos.
  const getInitialProfile = useCallback((dbProfile) => {
    const defaults = {
      type: null,
      interests: [],
      goals: [],
    };
    return {
      ...defaults,
      ...(dbProfile || {}),
      interests: dbProfile?.interests || [],
      goals: dbProfile?.goals || [],
    };
  }, []);
  
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  // Usamos la nueva función para garantizar un estado inicial seguro.
  const [userProfile, setUserProfile] = useState(() => getInitialProfile(profile?.onboarding_profile));

  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (profile) {
      const completed = profile.onboarding_completed || false;
      setIsCompleted(completed);
      setCurrentStep(profile.onboarding_step || 0);
      // Usamos la función de inicialización también aquí para sincronizar de forma segura.
      setUserProfile(getInitialProfile(profile.onboarding_profile));
      
      if (autoStart && !completed && user) {
        setIsActive(true);
      }
    }
  }, [profile, autoStart, user, getInitialProfile]);

  const saveProgressToDB = useCallback((progress) => {
    if (!user) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      logger.info('ONBOARDING_SAVE_START', 'Guardando progreso del onboarding en DB', { userId: user.id, ...progress });
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: progress.isCompleted,
          onboarding_step: progress.currentStep,
          onboarding_profile: progress.userProfile,
        })
        .eq('id', user.id);

      if (error) {
        logger.error('ONBOARDING_SAVE_ERROR', 'Error guardando progreso en DB', { userId: user.id, error: error.message });
      } else {
        logger.info('ONBOARDING_SAVE_SUCCESS', 'Progreso guardado exitosamente en DB');
        if (refreshProfile) {
          refreshProfile();
        }
      }
    }, 1000);
  }, [user, refreshProfile]);

  useEffect(() => {
    if (isActive) {
      saveProgressToDB({
        isCompleted,
        currentStep,
        userProfile,
      });
    }
  }, [isCompleted, currentStep, userProfile, isActive, saveProgressToDB]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
    if (enableAnalytics) {
      logger.info('ONBOARDING_STEP_COMPLETED', `Paso ${currentStep} completado`);
    }
  }, [currentStep, enableAnalytics]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback((finalData = {}) => {
    const finalProfile = { ...userProfile, ...finalData };
    setUserProfile(finalProfile);
    setIsCompleted(true);
    setIsActive(false);
    
    if (enableAnalytics) {
      logger.info('ONBOARDING_COMPLETED', 'Onboarding completado', { userProfile: finalProfile });
    }
    
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    saveProgressToDB({ 
      isCompleted: true, 
      currentStep: currentStep,
      userProfile: finalProfile 
    });
  }, [userProfile, enableAnalytics, currentStep, saveProgressToDB]);

  const dismissOnboarding = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true); 
    if (enableAnalytics) {
      logger.info('ONBOARDING_DISMISSED', 'Onboarding cerrado sin completar');
    }
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    saveProgressToDB({ isCompleted: true, currentStep, userProfile });
  }, [enableAnalytics, currentStep, userProfile, saveProgressToDB]);

  const resetOnboarding = useCallback(async () => {
    const initialProfile = { type: null, interests: [], goals: [] };
    setIsActive(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setUserProfile(initialProfile);
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    saveProgressToDB({ isCompleted: false, currentStep: 0, userProfile: initialProfile });

    if (enableAnalytics) {
      logger.info('ONBOARDING_RESET', 'Onboarding reiniciado');
    }
  }, [enableAnalytics, saveProgressToDB]);
  
  const updateUserProfile = useCallback((updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const pauseOnboarding = useCallback(() => setIsActive(false), []);
  const resumeOnboarding = useCallback(() => setIsActive(true), []);

  return {
    isActive,
    currentStep,
    isCompleted,
    userProfile,
    nextStep,
    previousStep,
    skipStep: nextStep,
    goToStep: setCurrentStep,
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
        // El error ocurría aquí. Ahora `interests` está garantizado que es un array.
        return onboarding.userProfile.interests.length > 0;
      case 'goals':
        // El error ocurría aquí. Ahora `goals` está garantizado que es un array.
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
  
  // ✅ CORRECCIÓN: Se evita la división por cero si solo hay un paso.
  const progressPercentage = steps.length > 1
    ? Math.round(((onboarding.currentStep) / (steps.length - 1)) * 100)
    : (onboarding.currentStep > 0 ? 100 : 0);

  return {
    ...onboarding,
    steps,
    getCurrentStepData,
    canContinue,
    completeCurrentStep,
    totalSteps: steps.length,
    progressPercentage,
  };
}

export default useOnboarding;