// src/pages/InfoPage.jsx
import { Link } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import SEO from '../components/SEO';

// --- Enhanced Icons ---
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconCompare = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm10 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>;
const IconExport = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const IconNews = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h6" /></svg>;
const IconStar = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;


export default function InfoPage() {
  const { user } = useAuth();
  const config = useConfig();

  if (!config) {
    return <div className="bg-slate-900 min-h-screen w-full" />; // Loading state
  }

  return (
    <>
      <SEO
        title={config.app.name}
        description={config.infoPage.hero.subtitle}
        noindex
      />
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

                {config.infoPage.features.items.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    icon={
                      index === 0 ? <IconChart /> :
                        index === 1 ? <IconCompare /> :
                          index === 2 ? <IconExport /> :
                            <IconNews />
                    }
                    title={feature.title}
                    description={feature.description}
                  />
                ))}

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