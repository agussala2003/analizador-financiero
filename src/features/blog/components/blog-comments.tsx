// src/features/blog/components/blog-comments.tsx
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Card } from '../../../components/ui/card';
import { MessageCircle, Send, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
  parent_comment_id?: string | null;
}

interface BlogCommentsProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  currentUserId?: string;
}

function CommentItem({ 
  comment, 
  onReply, 
  allComments,
  depth = 0
}: { 
  comment: Comment; 
  onReply: (commentId: string) => void;
  allComments: Comment[];
  depth?: number;
}) {
  const authorName = `${comment.author.first_name} ${comment.author.last_name}`.trim();
  const initials = `${comment.author.first_name[0]}${comment.author.last_name?.[0] || ''}`.toUpperCase();
  
  // Obtener respuestas directas a este comentario
  const replies = allComments.filter(c => c.parent_comment_id === comment.id);
  
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold body-sm">{authorName}</span>
              <span className="caption text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
              </span>
            </div>
            
            <p className="body-sm whitespace-pre-wrap break-words">{comment.content}</p>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="mt-2 h-7 caption"
            >
              <Reply className="w-3 h-3 mr-1" />
              Responder
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Respuestas anidadas - recursivas con límite de profundidad visual */}
      {replies.length > 0 && (
        <div className={depth < 3 ? "ml-8 space-y-3" : "ml-4 space-y-3"}>
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              allComments={allComments}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Función helper para verificar si un comentario pertenece a un hilo
const hasParentInThread = (comment: Comment, threadId: string, allComments: Comment[]): boolean => {
  if (!comment.parent_comment_id) return false;
  if (comment.parent_comment_id === threadId) return true;
  
  const parent = allComments.find(c => c.id === comment.parent_comment_id);
  if (!parent) return false;
  
  return hasParentInThread(parent, threadId, allComments);
};

export function BlogComments({ comments, onAddComment }: BlogCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Solo los comentarios principales (sin parent)
  const mainComments = comments.filter(c => !c.parent_comment_id);

  const handleSubmitMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    void onAddComment(newComment)
      .then(() => setNewComment(''))
      .finally(() => setIsSubmitting(false));
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    void onAddComment(replyContent, parentId)
      .then(() => {
        setReplyContent('');
        setReplyingTo(null);
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        <h2 className="heading-3 font-bold">
          Comentarios {comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {/* Formulario de nuevo comentario */}
      <Card className="p-4">
        <form onSubmit={handleSubmitMain} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Publicando...' : 'Publicar Comentario'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {mainComments.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              Sé el primero en comentar este artículo
            </p>
          </Card>
        ) : (
          mainComments.map(comment => {
            // Encontrar el comentario al que se está respondiendo (puede ser anidado)
            const findComment = (id: string): Comment | undefined => {
              return comments.find(c => c.id === id);
            };
            
            const replyingToComment = replyingTo ? findComment(replyingTo) : null;
            const isReplyingToThisThread = replyingToComment && 
              (replyingToComment.id === comment.id || 
               comments.some(c => c.parent_comment_id === comment.id && c.id === replyingTo) ||
               hasParentInThread(replyingToComment, comment.id, comments));

            return (
              <div key={comment.id} className="space-y-3">
                <CommentItem
                  comment={comment}
                  onReply={setReplyingTo}
                  allComments={comments}
                />
                
                {/* Formulario de respuesta - mostrar después del hilo completo */}
                {isReplyingToThisThread && (
                  <div className="ml-8">
                    <Card className="p-4">
                      <form onSubmit={(e) => handleSubmitReply(e, replyingTo!)} className="space-y-3">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          className="min-h-[80px] resize-none"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" size="sm" disabled={!replyContent.trim() || isSubmitting}>
                            <Send className="w-3 h-3 mr-2" />
                            {isSubmitting ? 'Enviando...' : 'Responder'}
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
