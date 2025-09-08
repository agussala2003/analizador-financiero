import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import SuggestionCardSkeleton from '../components/suggestion/SuggestionCardSkeleton';
import SuggestionCard from '../components/suggestion/SuggestionCard';
import { logger } from '../lib/logger';
import { useConfig } from '../context/ConfigContext';

const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const config = useConfig();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSuggestions([]);
        setError("Necesitas iniciar sesión para ver tus sugerencias.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        logger.error('SUGGESTIONS_FETCH_FAILED', 'Failed to fetch user suggestions', { errorMessage: fetchError.message });
        console.error('Error fetching suggestions:', fetchError);
        setError('No se pudieron cargar tus sugerencias.');
      } else {
        logger.info('SUGGESTIONS_FETCHED', 'User suggestions fetched successfully');
        setSuggestions(data);
      }
      setLoading(false);
    };

    fetchSuggestions();
  }, []);

  // Limpieza del mensaje de éxito para evitar memory leaks
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmitSuggestion = async (e) => {
    e.preventDefault();
    if (newSuggestion.trim().length < config.suggestions.minLength) {
      setError(`Tu sugerencia debe tener al menos ${config.suggestions.minLength} caracteres.`);
      return;
    }
    setFormLoading(true);
    setError(null);
    setSuccessMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError('Debes iniciar sesión para enviar una sugerencia.');
        setFormLoading(false);
        return;
    }

    const { data, error: insertError } = await supabase
      .from('suggestions')
      .insert({ content: newSuggestion, user_id: user.id })
      .select()
      .single();

    if (insertError) {
      logger.error('SUGGESTION_SUBMISSION_FAILED', 'Failed to submit user suggestion', { errorMessage: insertError.message });
      console.error('Error submitting suggestion:', insertError);
      setError('Hubo un problema al enviar tu sugerencia. Inténtalo de nuevo.');
    } else {
      logger.info('SUGGESTION_SUBMITTED', 'User suggestion submitted successfully');
      setSuggestions([data, ...suggestions]);
      setNewSuggestion('');
      setSuccessMessage('¡Gracias! Tu sugerencia ha sido enviada con éxito.');
    }
    setFormLoading(false);
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 mb-14">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Buzón de Sugerencias 💡</h1>
            <p className="text-gray-400 mt-2">¿Tienes una idea para mejorar la app? ¡Nos encantaría escucharla!</p>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg mb-10 border border-gray-700">
            <form onSubmit={handleSubmitSuggestion}>
              <textarea
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                placeholder="Escribe tu idea aquí... sé tan detallado como quieras."
                rows="4"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-colors"
                disabled={formLoading}
              />
              <button
                type="submit"
                disabled={formLoading || newSuggestion.trim().length < 10}
                className="cursor-pointer w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200"
              >
                {formLoading ? 'Enviando...' : 'Enviar mi Sugerencia'}
              </button>
              {error && <p className="text-red-400 text-sm mt-3 text-center" role="alert">{error}</p>}
              {successMessage && <p className="text-green-400 text-sm mt-3 text-center" role="status">{successMessage}</p>}
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2 mb-6">Mis Sugerencias Enviadas</h2>
            {/* Contenedor principal de la lista */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SuggestionCardSkeleton key={i} />)
              ) : suggestions.length > 0 ? (
                suggestions.map(suggestion => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))
              ) : (
                 <div className="md:col-span-2 lg:col-span-3 text-center text-gray-400 bg-gray-800 p-6 rounded-lg">
                    <p>{error ? error : "Aún no has enviado ninguna sugerencia. ¡Anímate a compartir tus ideas!"}</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuggestionsPage;