// src/pages/InfoPage.jsx
import { Link } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { IconBrain, IconChart, IconCompare, IconDividend, IconExport, IconFree, IconHeart, IconMatrix, IconNews, IconRadar, IconStar } from '../components/svg/infoIcons';

export default function InfoPage() {
  const { user } = useAuth();
  const config = useConfig();

  if (!config) {
    return <div className="bg-slate-900 min-h-screen w-full" />; // Loading state
  }

  return (
    <>
      <div className="bg-slate-900 text-gray-200 min-h-screen flex flex-col overflow-x-hidden">
        {user ? <Header /> : <></>}
        <main className="flex-grow">

          {/* --- Hero Section --- */}
          <section className="relative text-center py-24 sm:pt-32 px-4 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="absolute bg-blue-900/50 -translate-x-1/4 w-[80rem] h-[40rem] rounded-full blur-3xl" />
              <div className="absolute bg-teal-900/50 translate-x-1/4 w-[80rem] h-[40rem] rounded-full blur-3xl" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-6 animate-fade-in">
              {config.infoPage.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {config.infoPage.hero.subtitle}
            </p>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link
                to={user ? "/dashboard" : "/register"}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/40 inline-block"
              >
                {user ? config.infoPage.hero.cta.loggedIn : config.infoPage.hero.cta.loggedOut}
              </Link>
            </div>
          </section>

          {/* --- Features Section --- */}
          <section className="pb-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-center text-white mb-16" dangerouslySetInnerHTML={{ __html: config.infoPage.features.title }} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                {config.infoPage.features.items.map((feature, index) => {
                  const t = feature.title?.toLowerCase() || '';
                  const icon = t.includes('resumen') ? <IconBrain />
                    : t.includes('correlación') ? <IconMatrix />
                    : t.includes('radar') ? <IconRadar />
                    : t.includes('dividendo') ? <IconDividend />
                    : t.includes('noticia') ? <IconNews />
                    : t.includes('export') || t.includes('reporte') ? <IconExport />
                    : t.includes('comparar') ? <IconCompare />
                    : t.includes('acceso') ? <IconFree />
                    : t.includes('interfaz') ? <IconHeart />
                    : <IconChart />;
                  return (
                    <FeatureCard
                      key={index}
                      icon={icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  );
                })}

              </div>
            </div>
          </section>

          {/* --- Testimonial Section --- */}
          <section className="py-20 px-4 bg-slate-800/50">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-12">{config.infoPage.testimonial.title}</h2>
              <div className="bg-slate-900/70 p-8 rounded-2xl border border-slate-700 shadow-lg max-w-2xl mx-auto">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => <IconStar key={i} />)}
                </div>
                <p className="text-lg italic text-slate-300 mb-6">
                  "{config.infoPage.testimonial.quote}"
                </p>
                <p className="font-bold text-white">{config.infoPage.testimonial.author}</p>
              </div>
            </div>
          </section>

          {/* --- Final CTA Section --- */}
          <section className="text-center pt-20 pb-28 px-4">
            <h2 className="text-4xl font-bold text-white mb-4">{config.infoPage.finalCta.title}</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              {config.infoPage.finalCta.subtitle}
            </p>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
            >
              {user ? config.infoPage.finalCta.cta.loggedIn : config.infoPage.finalCta.cta.loggedOut}
            </Link>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}

// Componente helper para las tarjetas de características
const FeatureCard = ({ icon, title, description }) => (
  <div className="p-[1px] rounded-2xl bg-gradient-to-b from-slate-700 to-transparent transition-all duration-300 hover:bg-slate-700">
    <div className="bg-slate-800/90 h-full p-6 rounded-2xl text-center flex flex-col items-center transition-all duration-300 hover:bg-slate-800/50">
      <div className="mb-5 p-3 rounded-full bg-slate-700/50 border border-slate-600">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);