// src/pages/InfoPage.jsx
import { Link } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { useAuth } from '../context/AuthContext';

// --- Iconos para la sección de características ---
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconCompare = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm10 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>;
const IconExport = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const IconNews = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h6" /></svg>;


export default function InfoPage() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        
        {/* --- Hero Section --- */}
        <section className="text-center py-20 px-4 bg-gray-800/50">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
            Análisis Financiero, <span className="text-blue-400">Simplificado</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Toma el control de tus inversiones. Compara activos, analiza métricas clave y accede a datos de mercado de forma intuitiva y profesional.
          </p>
          <Link 
            to={user ? "/" : "/register"} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 inline-block animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {user ? "Ir al Dashboard" : "Crear Cuenta Gratis"}
          </Link>
        </section>

        {/* --- Features Section --- */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-12">Todo lo que necesitas en un solo lugar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              <FeatureCard 
                icon={<IconChart />}
                title="Análisis Fundamental Completo"
                description="Accede a decenas de indicadores de valoración, rentabilidad y salud financiera. Compara activos lado a lado con facilidad."
              />
              <FeatureCard 
                icon={<IconCompare />}
                title="Visualizaciones Clave"
                description="Entiende la dinámica del mercado con nuestra matriz de correlación y los gráficos de radar para una comparativa visual instantánea."
              />
              <FeatureCard 
                icon={<IconExport />}
                title="Reportes Profesionales"
                description="Exporta tus análisis a PDF con tema oscuro, CSV o Excel. Perfecto para tus informes personales o para compartir."
              />
              <FeatureCard 
                icon={<IconNews />}
                title="Datos de Mercado Relevantes"
                description="Mantente al día con un calendario de dividendos interactivo y las últimas noticias financieras que impactan tus inversiones."
              />
              
            </div>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="bg-gray-800/50 py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Potencia tus Decisiones de Inversión</h2>
                <p className="text-gray-300 mb-8">
                    El mercado financiero es complejo. Nuestra misión es darte las herramientas para navegarlo con confianza. Filtramos el ruido y te presentamos los datos que realmente importan, de una forma que puedas entender y utilizar.
                </p>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                    <p className="text-lg text-amber-400 font-semibold">¿Para quién es esta herramienta?</p>
                    <p className="text-gray-300">Inversores individuales, estudiantes de finanzas y cualquier persona que busque profundizar su análisis del mercado de valores.</p>
                </div>
            </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="text-center py-20 px-4">
            <h2 className="text-3xl font-bold text-white mb-4">¿Listo para empezar?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                Únete a nuestra comunidad y lleva tu análisis financiero al siguiente nivel. Es gratis para empezar.
            </p>
            <Link 
                to={user ? "/" : "/register"} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 inline-block"
            >
               {user ? "Volver al Dashboard" : "Comenzar Análisis"}
            </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}

// Componente helper para las tarjetas de características
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center flex flex-col items-center">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);