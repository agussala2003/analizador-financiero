// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";
import { useConfig } from "../hooks/useConfig";
import { useError } from "../hooks/useError";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

// --- Iconos para las tarjetas ---
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3" /></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;


// --- Componente de Botón para Pestañas ---
const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`cursor-pointer px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);


export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' o 'portfolio'
  const [limit, setLimit] = useState(null);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const config = useConfig();
  const { showError, showSuccess } = useError();

  useEffect(() => {
    if (profile) {
      setLimit(config.plans.roleLimits[profile.role] ?? config.plans.roleLimits.basico);
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile, config]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    logger.info('PROFILE_UPDATE_START', 'Usuario iniciando actualización de perfil', {
      userId: user.id,
      currentFirstName: profile?.first_name,
      currentLastName: profile?.last_name,
      newFirstName: firstName.trim(),
      newLastName: lastName.trim()
    });
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ 
        first_name: firstName.trim(), 
        last_name: lastName.trim() 
      }).eq('id', user.id);

      if (error) throw error;
      
      logger.info('PROFILE_UPDATE_SUCCESS', 'Perfil actualizado exitosamente', {
        userId: user.id,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      
      if (refreshProfile) await refreshProfile();
      showSuccess('¡Perfil actualizado con éxito!');
    } catch (err) {
      logger.error('PROFILE_UPDATE_FAILED', 'Error al actualizar perfil', {
        userId: user.id,
        error: err.message,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      showError('No se pudo actualizar el perfil.', { detail: err.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header />
        <main className="flex-grow flex items-center justify-center text-white text-xl">
          Cargando perfil...
        </main>
        <Footer />
      </div>
    ); 
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              Mi Perfil
            </h1>
            <p className="text-gray-400 mt-2">Gestiona tu información personal y visualiza tu portafolio.</p>
          </div>

          {/* Navegación de Pestañas */}
          <div className="flex justify-center items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700 mb-8 max-w-md mx-auto">
            <TabButton 
              isActive={activeTab === 'personal'} 
              onClick={() => {
                logger.info('PROFILE_TAB_CHANGED', 'Usuario cambió pestaña de perfil', {
                  fromTab: activeTab,
                  toTab: 'personal',
                  userId: user?.id
                });
                setActiveTab('personal');
              }}
            >
              Datos Personales
            </TabButton>
            <TabButton 
              isActive={activeTab === 'portfolio'} 
              onClick={() => {
                logger.info('PROFILE_TAB_CHANGED', 'Usuario cambió pestaña de perfil', {
                  fromTab: activeTab,
                  toTab: 'portfolio',
                  userId: user?.id
                });
                setActiveTab('portfolio');
              }}
            >
              Portafolio
            </TabButton>
          </div>

          {/* Contenido de las Pestañas */}
          <div>
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Columna Izquierda: Formulario */}
                <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <UserCircleIcon />
                    <h2 className="text-xl font-bold text-white">Información de la Cuenta</h2>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm text-gray-400 mb-1">Nombre</label>
                        <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-700 rounded-md p-2 text-white" disabled={isSaving}/>
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm text-gray-400 mb-1">Apellido</label>
                        <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-700 rounded-md p-2 text-white" disabled={isSaving} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm text-gray-400 mb-1">Email</label>
                      <input id="email" type="email" value={user.email} className="w-full bg-gray-700/50 rounded-md p-2 text-gray-300" disabled />
                    </div>
                    <button type="submit" disabled={isSaving} className="cursor-pointer w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500">
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </form>
                </div>

                {/* Columna Derecha: Plan y Uso */}
                <div className="space-y-6">
                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <BadgeIcon />
                      <h2 className="text-xl font-bold text-white">Mi Plan</h2>
                    </div>
                    <p className="text-blue-400 font-bold capitalize text-2xl">{profile.role}</p>
                    <p className="text-gray-300 mt-2 text-sm">Si tienes alguna pregunta sobre tu plan, no dudes en contactarnos.</p>
                  </div>

                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                     <div className="flex items-center gap-3 mb-4">
                       <ChipIcon />
                       <h2 className="text-xl font-bold text-white">Uso de API</h2>
                    </div>
                    <p className="text-gray-300 text-sm">Consultas hoy: <span className="font-semibold text-white">{profile.api_calls_made} / {limit === Infinity ? 'Ilimitadas' : limit}</span></p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(profile.api_calls_made / limit) * 100}%` }}></div></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="text-center py-20 px-6 bg-gray-800/50 rounded-xl border border-dashed border-gray-600 animate-fade-in">
                <h2 className="text-2xl font-bold text-white">Portafolio Próximamente</h2>
                <p className="text-gray-400 mt-2">Estamos trabajando en una nueva sección donde podrás seguir y analizar tus inversiones.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}