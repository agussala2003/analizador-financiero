// src/pages/MyPostsPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../lib/logger';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import DraftIcon from '../components/svg/draft';
import ClockIcon from '../components/svg/clock';
import CheckCircleIcon from '../components/svg/checkCircle';
import XCircleIcon from '../components/svg/xCircle';
import { TourButton } from '../components/onboarding/TooltipSystem';

const statusConfig = {
  draft: { label: 'Borrador', Icon: DraftIcon, style: 'bg-gray-700 text-gray-300' },
  pending_review: { label: 'Pendiente', Icon: ClockIcon, style: 'bg-yellow-600/50 text-yellow-300' },
  approved: { label: 'Aprobado', Icon: CheckCircleIcon, style: 'bg-green-600/50 text-green-300' },
  rejected: { label: 'Rechazado', Icon: XCircleIcon, style: 'bg-red-600/50 text-red-300' },
};

const myPostsPageTourSteps = [
  {
    selector: '[data-tour="create-post-button"]',
    title: '1. Crea una Nueva Publicación',
    description: 'Haz clic aquí para empezar a escribir un nuevo artículo para el blog. Serás llevado al editor de texto.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="post-card"]',
    title: '2. Tus Publicaciones',
    description: 'Aquí aparecerán todas tus publicaciones. Podrás ver su estado actual (Borrador, Pendiente, Aprobado o Rechazado).',
    placement: 'top'
  },
  {
    selector: '[data-tour="post-actions"]',
    title: '3. Acciones Disponibles',
    description: 'Dependiendo del estado, podrás editar un borrador, ver una publicación aprobada o revisar por qué fue rechazada para corregirla.',
    placement: 'top'
  }
];

// --- Componente de Tarjeta de Publicación ---
function PostCard({ post }) {
  const { label, Icon, style } = statusConfig[post.status] || {};
  const canEdit = post.status === 'draft' || post.status === 'rejected';

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
      {post.featured_image_url && (
        <img src={post.featured_image_url} alt={post.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="font-bold text-white text-lg flex-grow">{post.title}</h2>
        <div data-tour="post-actions" className="flex justify-between items-center mt-4">
          <span className={`flex items-center gap-2 text-xs px-2.5 py-1 rounded-full font-semibold ${style}`}>
            <Icon />
            {label}
          </span>
          {canEdit ? (
            <Link 
              to={`/blogs/edit/${post.slug}`} 
              onClick={() => {
                logger.info('MY_POSTS_EDIT_NAVIGATION', 'Usuario navegando a editar publicación', {
                  postId: post.id,
                  postTitle: post.title,
                  postStatus: post.status,
                  postSlug: post.slug
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              Editar
            </Link>
          ) : post.status === 'approved' ? (
            <Link 
              to={`/blogs/${post.slug}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => {
                logger.info('MY_POSTS_VIEW_PUBLISHED', 'Usuario visualizando publicación publicada', {
                  postId: post.id,
                  postTitle: post.title,
                  postSlug: post.slug,
                  openedInNewTab: true
                });
              }}
              className="bg-gray-600 hover:bg-gray-500 text-white text-sm py-2 px-4 rounded-lg font-semibold transition-colors"
            >
              Ver Publicación
            </Link>
          ) : (
            <span className="text-gray-400 text-sm py-2 px-4">En Revisión</span>
          )}
        </div>
      </div>
    </div>
  );
}


export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      
      logger.info('MY_POSTS_FETCH_START', 'Iniciando obtención de publicaciones del usuario', {
        userId: user.id,
        userEmail: user.email
      });
      
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('MY_POSTS_FETCH_FAILED', 'Error al obtener publicaciones del usuario', {
          userId: user.id,
          error: error.message,
          code: error.code
        });
        console.error('Error fetching user posts:', error);
      } else {
        logger.info('MY_POSTS_FETCH_SUCCESS', 'Publicaciones del usuario obtenidas exitosamente', {
          userId: user.id,
          postsCount: data?.length || 0,
          postsStatuses: data?.reduce((acc, post) => {
            acc[post.status] = (acc[post.status] || 0) + 1;
            return acc;
          }, {}) || {}
        });
        setPosts(data);
      }
      setLoading(false);
    };
    fetchUserPosts();
  }, [user]);
  
  const SkeletonCard = () => (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden animate-pulse">
        <div className="h-40 bg-gray-700"></div>
        <div className="p-5">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-700 rounded-full w-24"></div>
                <div className="h-10 bg-gray-600 rounded-lg w-20"></div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
           <div>
             <h1 className="text-3xl sm:text-4xl font-bold text-white">Mis Publicaciones</h1>
           </div>
           <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <TourButton className='md:cursor-pointer' tourSteps={myPostsPageTourSteps} />
              </div>
             <button
               data-tour="create-post-button"
               onClick={() => {
                 logger.info('MY_POSTS_CREATE_NAVIGATION', 'Usuario navegando a crear nueva publicación', {
                   userId: user?.id,
                   currentPostsCount: posts.length
                 });
                 navigate('/blogs/create');
               }}
               className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg transition-colors self-start sm:self-center"
             >
               Crear Nuevo
             </button>
           </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white">Aún no tienes publicaciones</h2>
              <p className="text-gray-400 mt-2 mb-6">¡Anímate a compartir tus ideas con la comunidad!</p>
              <button
                onClick={() => {
                  logger.info('MY_POSTS_FIRST_POST_NAVIGATION', 'Usuario navegando a crear primera publicación', {
                    userId: user?.id,
                    context: 'empty_state'
                  });
                  navigate('/blogs/create');
                }}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Crear mi primera publicación
              </button>
            </div>
          ) : (
            <div data-tour="post-card" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}