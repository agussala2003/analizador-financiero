// src/features/admin/components/logs/log-metadata-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import type { AdminLog } from '../../../../types/admin';

/**
 * Props para el componente LogMetadataModal.
 * @property log - Log cuya metadata se va a visualizar (null si el modal está cerrado)
 * @property isOpen - Estado de visibilidad del modal
 * @property onClose - Callback al cerrar el modal
 */
interface LogMetadataModalProps {
  log: AdminLog | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal para visualizar los metadatos JSON de un log del sistema.
 * Muestra el contenido formateado en un bloque de código pre-formateado.
 * 
 * @example
 * ```tsx
 * <LogMetadataModal
 *   log={selectedLog}
 *   isOpen={!!selectedLog}
 *   onClose={() => setSelectedLog(null)}
 * />
 * ```
 */
export function LogMetadataModal({
  log,
  isOpen,
  onClose,
}: LogMetadataModalProps) {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Metadatos del Log #{log.id}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 bg-muted/50 p-4 rounded-md max-h-96 overflow-auto">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
