// src/components/blogs/BlogInteractions.jsx
import { HeartIcon, BookmarkIcon, ChatBubbleLeftIcon } from './InteractionIcons';

export default function BlogInteractions({
  likesCount,
  commentsCount,
  userHasLiked,
  userHasBookmarked,
  onLike,
  onBookmark
}) {
  return (
    <div className="flex items-center gap-6 text-gray-400">
      {/* --- Likes --- */}
      <button onClick={onLike} className="flex items-center gap-2 group">
        <HeartIcon 
          className={`w-6 h-6 transition-all duration-200 group-hover:text-red-400 ${userHasLiked ? 'text-red-500 fill-current' : ''}`}
        />
        <span className={`font-semibold ${userHasLiked ? 'text-white' : ''}`}>{likesCount}</span>
      </button>

      {/* --- Comentarios (solo display) --- */}
      <div className="flex items-center gap-2">
        <ChatBubbleLeftIcon className="w-6 h-6" />
        <span className="font-semibold text-white">{commentsCount}</span>
      </div>
      
      {/* --- Marcador (Favoritos) --- */}
      <button onClick={onBookmark} className="flex items-center gap-2 group ml-auto">
        <BookmarkIcon 
          className={`w-6 h-6 transition-all duration-200 group-hover:text-yellow-400 ${userHasBookmarked ? 'text-yellow-400 fill-current' : ''}`}
        />
      </button>
    </div>
  );
}