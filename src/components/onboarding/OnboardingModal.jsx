// src/components/onboarding/OnboardingModal.jsx
import { useFinancialOnboarding } from '../../hooks/useOnboarding';

/**
 * Modal principal del onboarding con un diseño moderno y amigable.
 */
export function OnboardingModal() {
  const {
    isActive,
    currentStep,
    getCurrentStepData,
    canContinue,
    completeCurrentStep,
    previousStep,
    skipStep,
    pauseOnboarding,
    dismissOnboarding,
    canGoBack,
    totalSteps,
    progressPercentage,
    userProfile,
    updateUserProfile
  } = useFinancialOnboarding();

  if (!isActive) return null;

  const stepData = getCurrentStepData();
  if (!stepData) return null;

  const handleNext = () => {
    completeCurrentStep();
  };

  const handleSkip = () => {
    skipStep('user_choice');
  };

  const handleClose = () => {
    pauseOnboarding();
  };

  const handleDismiss = () => {
    dismissOnboarding();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-modal-in">
        {/* Header con progreso */}
        <div className="bg-slate-50 p-6 border-b border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{stepData.title}</h2>
              <p className="text-slate-500 text-sm mt-1">¡Bienvenido! Te ayudamos a comenzar</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-slate-800 transition-colors text-sm px-3 py-1.5 rounded-md hover:bg-slate-200"
                title="No mostrar de nuevo"
              >
                No mostrar
              </button>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-full hover:bg-slate-200"
                title="Cerrar temporalmente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <p className="text-slate-600 mb-4 text-base">{stepData.description}</p>
          
          {/* Barra de progreso */}
          <div className="bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 rounded-full h-2.5 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-slate-500 mt-2">
            <span>Paso {currentStep + 1} de {totalSteps}</span>
            <span>{progressPercentage}% completado</span>
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="p-8 overflow-y-auto bg-white text-slate-800 flex-grow">
          <StepContent 
            stepData={stepData}
            userProfile={userProfile}
            updateUserProfile={updateUserProfile}
          />
        </div>

        {/* Footer con botones */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex space-x-2">
            {canGoBack && (
              <button
                onClick={previousStep}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors hover:bg-slate-200 rounded-lg"
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors hover:bg-slate-200 rounded-lg"
            >
              Saltar
            </button>
          </div>
          
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-sm ${
              canContinue()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {currentStep >= totalSteps - 1 ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Contenido dinámico según el tipo de paso
 */
function StepContent({ stepData, userProfile, updateUserProfile }) {
  switch (stepData.component) {
    case 'WelcomeStep':
      return <WelcomeStep />;
    case 'UserTypeStep':
      return (
        <UserTypeStep
          options={stepData.options}
          value={userProfile.type}
          onChange={(type) => updateUserProfile({ type })}
        />
      );
    case 'InterestsStep':
      return (
        <InterestsStep
          options={stepData.options}
          values={userProfile.interests}
          onChange={(interests) => updateUserProfile({ interests })}
        />
      );
    case 'GoalsStep':
      return (
        <GoalsStep
          options={stepData.options}
          values={userProfile.goals}
          onChange={(goals) => updateUserProfile({ goals })}
        />
      );
    case 'DashboardTourStep':
      return <DashboardTourStep />;
    case 'FeaturesStep':
      return <FeaturesStep features={stepData.features} />;
    case 'CompletionStep':
      return <CompletionStep userProfile={userProfile} />;
    default:
      return <div>Paso no encontrado</div>;
  }
}

/**
 * Paso de bienvenida
 */
function WelcomeStep() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-6">
        <span className="text-4xl">🎉</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        ¡Bienvenido a tu nueva experiencia financiera!
      </h3>
      <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto">
        Estamos aquí para ayudarte a navegar el mundo de las inversiones de manera inteligente y segura.
        En los próximos pasos, personalizaremos tu experiencia según tus necesidades.
      </p>
      <div className="grid grid-cols-3 gap-6 mt-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl mb-2">📈</div>
          <p className="text-sm text-slate-600 font-medium">Seguimiento en tiempo real</p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl mb-2">🎯</div>
          <p className="text-sm text-slate-600 font-medium">Contenido personalizado</p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl mb-2">🔔</div>
          <p className="text-sm text-slate-600 font-medium">Alertas inteligentes</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Paso de selección de tipo de usuario
 */
function UserTypeStep({ options, value, onChange }) {
  return (
    <div className="space-y-4">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left ${
            value === option.value
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
          }`}
        >
          <div className="font-semibold text-lg text-slate-800">{option.label}</div>
          <div className="text-slate-600 mt-1">{option.description}</div>
        </button>
      ))}
    </div>
  );
}

/**
 * Paso de selección múltiple de intereses
 */
function InterestsStep({ options, values, onChange }) {
  const toggleInterest = (interest) => {
    const newValues = values.includes(interest)
      ? values.filter(v => v !== interest)
      : [...values, interest];
    onChange(newValues);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => toggleInterest(option.value)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-center flex flex-col items-center justify-center h-32 ${
            values.includes(option.value)
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
          }`}
        >
          <div className="text-3xl mb-2">{option.icon}</div>
          <div className="font-medium text-slate-700">{option.label}</div>
        </button>
      ))}
    </div>
  );
}

/**
 * Paso de selección de objetivos
 */
function GoalsStep({ options, values, onChange }) {
  const toggleGoal = (goal) => {
    const newValues = values.includes(goal)
      ? values.filter(v => v !== goal)
      : [...values, goal];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => toggleGoal(option.value)}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center ${
            values.includes(option.value)
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50'
          }`}
        >
          <span className="text-3xl mr-4">{option.icon}</span>
          <div>
            <div className="font-medium text-slate-800 text-base">{option.label}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

/**
 * Tour del dashboard
 */
function DashboardTourStep() {
  return (
    <div className="text-center py-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 mb-4">
        <span className="text-3xl">👀</span>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-4">Exploremos tu nuevo dashboard</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Te mostraremos las funciones principales para que puedas aprovechar al máximo la plataforma.
      </p>
      <div className="bg-slate-100 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
            <span className="text-slate-700">Barra de navegación superior</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
            <span className="text-slate-700">Panel de búsqueda inteligente</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
            <span className="text-slate-700">Notificaciones en tiempo real</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
            <span className="text-slate-700">Menú de configuración</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Showcase de funcionalidades
 */
function FeaturesStep({ features }) {
  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <div key={feature.id} className="flex items-start p-4 bg-slate-50 rounded-lg">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
            <span className="text-xl text-indigo-600">✨</span>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-slate-800">{feature.title}</h4>
            <p className="text-slate-600">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Paso de finalización
 */
function CompletionStep({ userProfile }) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
        <span className="text-4xl">🎊</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        ¡Todo está listo!
      </h3>
      <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
        Hemos configurado tu experiencia basada en tus preferencias.
      </p>
      
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-left max-w-sm mx-auto">
        <h4 className="font-semibold mb-4 text-slate-800">Tu perfil personalizado:</h4>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-slate-500">Nivel:</span>
            <span className="ml-2 text-slate-700 font-semibold">{userProfile.type}</span>
          </div>
          <div>
            <span className="font-medium text-slate-500">Intereses:</span>
            <span className="ml-2 text-slate-700">{userProfile.interests.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-slate-500">Objetivos:</span>
            <span className="ml-2 text-slate-700">{userProfile.goals.join(', ')}</span>
          </div>
        </div>
      </div>
      
      <p className="text-slate-500 text-sm mt-6">
        Puedes cambiar estas preferencias en cualquier momento desde tu perfil.
      </p>
    </div>
  );
}

export default OnboardingModal;