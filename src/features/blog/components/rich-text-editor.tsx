// src/features/blog/components/rich-text-editor.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Quote,
  Code,
  Heading2,
  Eye,
  FileEdit
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Escribe el contenido de tu blog..." }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertMarkdown = (before: string, after = '') => {
    const textarea = document.getElementById('blog-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restaurar el foco y la selección
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**'), label: 'Negrita' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), label: 'Cursiva' },
    { icon: Heading2, action: () => insertMarkdown('\n## '), label: 'Título' },
    { icon: Quote, action: () => insertMarkdown('\n> '), label: 'Cita' },
    { icon: Code, action: () => insertMarkdown('`', '`'), label: 'Código' },
    { icon: List, action: () => insertMarkdown('\n- '), label: 'Lista' },
    { icon: ListOrdered, action: () => insertMarkdown('\n1. '), label: 'Lista numerada' },
    { icon: LinkIcon, action: () => insertMarkdown('[', '](url)'), label: 'Enlace' },
    { icon: ImageIcon, action: () => insertMarkdown('![alt](', ')'), label: 'Imagen' },
  ];



  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <FileEdit className="w-4 h-4" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vista Previa
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'edit' && (
            <div className="flex items-center gap-1 flex-wrap">
              {toolbarButtons.map((btn, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={btn.action}
                  title={btn.label}
                  className="h-8 w-8 p-0"
                >
                  <btn.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="edit" className="mt-0">
          <textarea
            id="blog-content"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full min-h-[400px] p-4 rounded-lg border bg-background",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "font-mono body-sm resize-y"
            )}
          />
          <p className="caption text-muted-foreground mt-2">
            💡 Tip: Usa Markdown para dar formato. Selecciona texto y usa los botones de la barra de herramientas.
          </p>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className={cn(
            "w-full min-h-[400px] p-6 rounded-lg border bg-background",
            "prose prose-lg dark:prose-invert max-w-none"
          )}>
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  img: ({ ...props }) => (
                    <img
                      {...props}
                      className="rounded-lg shadow-md my-4 mx-auto max-w-full h-auto"
                      loading="lazy"
                      alt={props.alt ?? ''}
                    />
                  ),
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    />
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ ...props }) => (
                    <blockquote
                      {...props}
                      className="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-4 italic"
                    />
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">El contenido aparecerá aquí...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
