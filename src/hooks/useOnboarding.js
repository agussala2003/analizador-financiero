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
  const { user, profile, refreshProfile } = useAuth(); // Usamos el perfil del contexto de Auth

  // El estado inicial ahora se deriva del perfil del usuario
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(profile?.onboarding_step || 0);
  const [isCompleted, setIsCompleted] = useState(profile?.onboarding_completed || false);
  const [userProfile, setUserProfile] = useState(profile?.onboarding_profile || {
    type: null,
    interests: [],
    goals: []
  });

  const debounceTimeoutRef = useRef(null);

  // Cargar el estado inicial del onboarding desde el perfil del usuario
  useEffect(() => {
    if (profile) {
      const completed = profile.onboarding_completed || false;
      setIsCompleted(completed);
      setCurrentStep(profile.onboarding_step || 0);
      setUserProfile(profile.onboarding_profile || { type: null, interests: [], goals: [] });
      
      // Iniciar automáticamente solo si no está completo y el usuario está cargado
      if (autoStart && !completed && user) {
        setIsActive(true);
      }
    }
  }, [profile, autoStart, user]);

  // Función para guardar el progreso en la base de datos con debounce
  const saveProgressToDB = useCallback((progress) => {
    if (!user) return;

    // Cancelar el guardado anterior si se llama de nuevo rápidamente
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
        // Opcional: refrescar el perfil global para que otros componentes tengan los datos actualizados
        if (refreshProfile) {
          refreshProfile();
        }
      }
    }, 1000); // Espera 1 segundo antes de guardar para evitar escrituras excesivas
  }, [user, refreshProfile]);

  // Cada vez que un estado relevante cambia, preparamos el guardado
  useEffect(() => {
    // No guardar si el onboarding no está activo para evitar escrituras innecesarias al cargar
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
    
    // Forzar el guardado inmediato al completar
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    saveProgressToDB({ 
      isCompleted: true, 
      currentStep: currentStep, // Guardamos el último paso también
      userProfile: finalProfile 
    });
  }, [userProfile, enableAnalytics, currentStep, saveProgressToDB]);

  const dismissOnboarding = useCallback(() => {
    setIsActive(false);
    // Marcamos como completo para que no vuelva a aparecer
    setIsCompleted(true); 
    if (enableAnalytics) {
      logger.info('ONBOARDING_DISMISSED', 'Onboarding cerrado sin completar');
    }
     // Forzar el guardado inmediato al descartar
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    saveProgressToDB({ isCompleted: true, currentStep, userProfile });
  }, [enableAnalytics, currentStep, userProfile, saveProgressToDB]);

  const resetOnboarding = useCallback(async () => {
    const initialProfile = { type: null, interests: [], goals: [] };
    setIsActive(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setUserProfile(initialProfile);
    // Forzar guardado inmediato del reseteo
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
    skipStep: nextStep, // Saltar simplemente avanza al siguiente paso
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