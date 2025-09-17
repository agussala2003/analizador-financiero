// src/components/blogs/BlogComments.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const CommentCard = ({ comment }) => {
  const authorName = comment.author?.first_name 
    ? `${comment.author.first_name} ${comment.author.last_name || ''}`.trim() 
    : 'Anónimo';
  
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-600 grid place-items-center text-sm font-bold flex-shrink-0">
        {authorName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 bg-gray-800 p-3 rounded-lg">
        <p className="font-semibold text-white text-sm">{authorName}</p>
        <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
        <p className="text-xs text-gray-500 mt-2 text-right">
          {new Date(comment.created_at).toLocaleString('es-ES')}
        </p>
      </div>
    </div>
  );
};

export default function BlogComments({ comments, onAddComment }) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    await onAddComment(newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-white mb-6">Comentarios ({comments.length})</h3>
      
      {/* Formulario para nuevo comentario */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            rows="3"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
            required
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:bg-gray-500"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Comentario'}
          </button>
        </form>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map(comment => <CommentCard key={comment.id} comment={comment} />)
        ) : (
          <p className="text-gray-500 text-center py-4">Sé el primero en comentar.</p>
        )}
      </div>
    </div>
  );
}