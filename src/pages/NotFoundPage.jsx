import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import SEO from '../components/SEO';

const NotFoundPage = () => {
  const config = useConfig();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <SEO
        title={config.app.name}
        description={config.infoPage.hero.subtitle}
        noindex
      />
      <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página No Encontrada</h2>
      <p className="text-gray-400 mb-8">
        Lo sentimos, la página que estás buscando no existe.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
