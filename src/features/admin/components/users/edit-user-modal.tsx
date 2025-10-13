// src/features/admin/components/users/edit-user-modal.tsx

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../../components/ui/dialog';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Switch } from '../../../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import type { AdminUser } from '../../../../types/admin';

/**
 * Props para el componente EditUserModal.
 * @property user - Usuario a editar (null si el modal está cerrado)
 * @property isOpen - Estado de visibilidad del modal
 * @property onClose - Callback al cerrar el modal
 * @property onUserUpdate - Callback después de actualizar exitosamente
 */
interface EditUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}

/**
 * Modal para editar la información de un usuario desde el panel de administración.
 * Permite modificar nombre, apellido, rol y permisos de blog.
 * 
 * @example
 * ```tsx
 * <EditUserModal
 *   user={selectedUser}
 *   isOpen={!!selectedUser}
 *   onClose={() => setSelectedUser(null)}
 *   onUserUpdate={refetchUsers}
 * />
 * ```
 */
export function EditUserModal({
  user,
  isOpen,
  onClose,
  onUserUpdate,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<AdminUser>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        role: user.role ?? 'basico',
        can_upload_blog: user.can_upload_blog ?? false,
      });
    }
  }, [user]);

  const handleChange = (field: keyof AdminUser, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`Usuario ${user.email} actualizado.`);
      onUserUpdate();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Error al actualizar el usuario.', { description: message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={formData.first_name ?? ''}
                onChange={(e) => handleChange('first_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={formData.last_name ?? ''}
                onChange={(e) => handleChange('last_name', e.target.value)}
              />
            </div>
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basico">Básico</SelectItem>
                <SelectItem value="plus">Plus</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permiso de Blog */}
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="can-upload-blog"
              checked={formData.can_upload_blog}
              onCheckedChange={(checked) =>
                handleChange('can_upload_blog', checked)
              }
            />
            <Label htmlFor="can-upload-blog">Permitir subir Blogs</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
