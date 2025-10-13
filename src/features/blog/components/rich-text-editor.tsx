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

  // Renderizar markdown simple para preview
  const renderPreview = (text: string) => {
    let html = text;
    
    // Títulos
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');
    
    // Negrita e itálica
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Enlaces
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Imágenes
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />');
    
    // Código inline
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-sm">$1</code>');
    
    // Citas
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>');
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>');
    
    // Listas
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');
    
    // Párrafos
    html = html.split('\n\n').map(p => {
      if (p.startsWith('<') || p.trim() === '') return p;
      return `<p class="mb-4">${p}</p>`;
    }).join('\n');
    
    return html;
  };

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
              "font-mono text-sm resize-y"
            )}
          />
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Usa Markdown para dar formato. Selecciona texto y usa los botones de la barra de herramientas.
          </p>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className={cn(
            "w-full min-h-[400px] p-6 rounded-lg border bg-background",
            "prose prose-invert max-w-none"
          )}>
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: renderPreview(value) }} />
            ) : (
              <p className="text-muted-foreground italic">El contenido aparecerá aquí...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
