// src/components/admin/AdminBlogsModule.jsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useError } from '../../hooks/useError';
import DOMPurify from 'dompurify';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import { logger } from '../../lib/logger';

// --- Iconos para estados (componentes pequeños) ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const DraftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;


// --- Mapeo de estilos para cada estado ---
const statusConfig = {
  pending_review: { label: 'Pendiente', Icon: ClockIcon, color: 'text-yellow-400' },
  approved: { label: 'Aprobado', Icon: CheckCircleIcon, color: 'text-green-400' },
  rejected: { label: 'Rechazado', Icon: XCircleIcon, color: 'text-red-400' },
  draft: { label: 'Borrador', Icon: DraftIcon, color: 'text-gray-400' },
};

// --- Componente de Tarjeta para cada Blog ---
function BlogManagementCard({ blog, onStatusChange, onViewContent, loadingStates = {} }) {
  const { label, Icon, color } = statusConfig[blog.status] || { label: 'Desconocido', Icon: () => null, color: 'text-gray-500' };

  return (
    <div className="bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-700 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-lg truncate">{blog.title}</h4>
          <p className="text-xs text-gray-400 mt-1">
            Por: <span className="font-medium text-gray-300">{blog.author?.first_name || blog.author?.email}</span>
          </p>
        </div>
        <div className={`flex items-center gap-2 mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-semibold ${color} bg-gray-900/50`}>
          <Icon />
          <span>{label}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-gray-700 pt-4">
        <button onClick={() => onViewContent(blog)} className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
          Ver Contenido
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onStatusChange(blog.id, 'approved')} 
            disabled={loadingStates[`${blog.id}-approved`]}
            className="cursor-pointer flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStates[`${blog.id}-approved`] ? <Loader variant="spin" size="sm" color="white" /> : 'Aprobar'}
          </button>
          <button 
            onClick={() => onStatusChange(blog.id, 'rejected')} 
            disabled={loadingStates[`${blog.id}-rejected`]}
            className="cursor-pointer flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStates[`${blog.id}-rejected`] ? <Loader variant="spin" size="sm" color="white" /> : 'Rechazar'}
          </button>
          <button 
            onClick={() => onStatusChange(blog.id, 'draft')} 
            disabled={loadingStates[`${blog.id}-draft`]}
            className="cursor-pointer flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 text-nowrap rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStates[`${blog.id}-draft`] ? <Loader variant="spin" size="sm" color="white" /> : 'A Borrador'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal del Módulo ---
export default function AdminBlogsModule() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedBlog, setSelectedBlog] = useState(null);
  const { showError, showSuccess } = useError(); // Asumimos que tienes showSuccess

  const fetchAllBlogs = useCallback(async () => {
    logger.info('ADMIN_BLOGS_FETCH_START', 'Admin attempting to fetch all blogs');
    const { data, error } = await supabase
      .from('blogs')
      .select('*, author:profiles(first_name, last_name, email)')
      .order('created_at', { ascending: false });
      
    if (error) {
      logger.error('ADMIN_BLOGS_FETCH_FAILED', 'Failed to fetch blogs for admin', { errorMessage: error.message });
      showError("No se pudieron cargar los blogs.", { detail: error.message });
    } else {
      logger.info('ADMIN_BLOGS_FETCH_SUCCESS', `Successfully fetched ${data.length} blogs for admin`);
      setBlogs(data);
    }
  }, [showError]);

  useEffect(() => {
    setLoading(true);
    fetchAllBlogs().finally(() => setLoading(false));
  }, [fetchAllBlogs]);
  
  const handleStatusChange = async (blogId, newStatus) => {
    const loadingKey = `${blogId}-${newStatus}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const originalBlog = blogs.find(b => b.id === blogId);
      logger.info('ADMIN_BLOG_STATUS_CHANGE_START', `Admin changing blog status to ${newStatus}`, { 
        blogId, 
        newStatus, 
        previousStatus: originalBlog?.status,
        blogTitle: originalBlog?.title 
      });
      
      const updateData = { status: newStatus };

      // Solo actualiza la fecha de publicación si se aprueba por primera vez
      if (newStatus === 'approved' && !originalBlog?.published_at) {
        updateData.published_at = new Date().toISOString();
        logger.info('ADMIN_BLOG_PUBLISHED', `Blog published for first time`, { blogId, blogTitle: originalBlog?.title });
      }

      const { error } = await supabase.from('blogs').update(updateData).eq('id', blogId);
      if (error) {
        logger.error('ADMIN_BLOG_STATUS_CHANGE_FAILED', 'Failed to update blog status', { 
          blogId, 
          newStatus, 
          errorMessage: error.message 
        });
        showError("No se pudo actualizar el estado del blog.", { detail: error.message });
      } else {
        logger.info('ADMIN_BLOG_STATUS_CHANGE_SUCCESS', `Blog status successfully changed to ${newStatus}`, { 
          blogId, 
          newStatus,
          blogTitle: originalBlog?.title 
        });
        showSuccess(`Blog movido a "${newStatus}".`);
        fetchAllBlogs(); // Recargar la lista para reflejar los cambios
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  if (loading) {
      return (
          <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 p-5 rounded-xl h-28 animate-pulse" />
              ))}
          </div>
      );
  }

  return (
    <>
      <section className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-4">Gestión de Blogs</h3>
        {blogs.length === 0 ? (
          <div className="text-center py-12 px-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="text-xl font-bold text-white">¡Todo al día!</h4>
            <p className="text-gray-400 mt-2">No hay publicaciones pendientes de revisión.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map(blog => (
              <BlogManagementCard 
                key={blog.id} 
                blog={blog} 
                onStatusChange={handleStatusChange}
                onViewContent={setSelectedBlog}
                loadingStates={loadingStates}
              />
            ))}
          </div>
        )}
      </section>

      <Modal isOpen={!!selectedBlog} onClose={() => setSelectedBlog(null)} title={selectedBlog?.title || ''}>
        {selectedBlog && (
          <article className="prose prose-invert max-w-none">
            {selectedBlog.featured_image_url && (
              <img src={selectedBlog.featured_image_url} alt={selectedBlog.title} className="w-full rounded-lg mb-6"/>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedBlog.content) }}
            />
          </article>
        )}
      </Modal>
    </>
  );
}