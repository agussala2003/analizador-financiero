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
  replies 
}: { 
  comment: Comment; 
  onReply: (commentId: string) => void;
  replies: Comment[];
}) {
  const authorName = `${comment.author.first_name} ${comment.author.last_name}`.trim();
  const initials = `${comment.author.first_name[0]}${comment.author.last_name?.[0] || ''}`.toUpperCase();
  
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
              </span>
            </div>
            
            <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="mt-2 h-7 text-xs"
            >
              <Reply className="w-3 h-3 mr-1" />
              Responder
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Respuestas anidadas */}
      {replies.length > 0 && (
        <div className="ml-8 space-y-3">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              replies={[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogComments({ comments, onAddComment }: BlogCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Separar comentarios principales y respuestas
  const mainComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId: string) => 
    comments.filter(c => c.parent_comment_id === commentId);

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
        <h2 className="text-2xl font-bold">
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
          mainComments.map(comment => (
            <div key={comment.id} className="space-y-3">
              <CommentItem
                comment={comment}
                onReply={setReplyingTo}
                replies={getReplies(comment.id)}
              />
              
              {/* Formulario de respuesta */}
              {replyingTo === comment.id && (
                <div className="ml-8">
                  <Card className="p-4">
                    <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="space-y-3">
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
          ))
        )}
      </div>
    </div>
  );
}
