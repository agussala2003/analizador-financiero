import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, ColumnDef, SortingState } from "@tanstack/react-table";
import { AdminUser } from "../../../types/admin";
import { DataTable } from '../../dividends/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ArrowUpDown, Edit, Search } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { useDebounce } from "../../../hooks/use-debounce";

// --- Modal para Editar Usuario ---

interface EditUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}

const EditUserModal = ({ user, isOpen, onClose, onUserUpdate }: EditUserModalProps) => {
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
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('profiles').update(formData).eq('id', user.id);
            if (error) throw error;
            toast.success(`Usuario ${user.email} actualizado.`);
            onUserUpdate();
            onClose();
        } catch (err: unknown) {
            const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message : String(err);
            toast.error("Error al actualizar el usuario.", { description: message });
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input id="firstName" value={formData.first_name ?? ''} onChange={(e) => handleChange('first_name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input id="lastName" value={formData.last_name ?? ''} onChange={(e) => handleChange('last_name', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="basico">Básico</SelectItem>
                                <SelectItem value="plus">Plus</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="administrador">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="can-upload-blog" checked={formData.can_upload_blog} onCheckedChange={(checked) => handleChange('can_upload_blog', checked)} />
                        <Label htmlFor="can-upload-blog">Permitir subir Blogs</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => void handleSubmit()} disabled={loading}>{loading ? "Guardando..." : "Guardar Cambios"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- Página de Gestión de Usuarios ---
export function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const debouncedFilter = useDebounce(filter, 300);

    const fetchUsers = async () => {
        // No seteamos loading aquí para que la actualización sea en segundo plano
        try {
            const { data, error }: { data: AdminUser[] | null, error: unknown } = await supabase.from('profiles').select('*');
            if (error) {
                let errorMsg: string;
                if (typeof error === 'object' && error !== null) {
                    try {
                        errorMsg = JSON.stringify(error);
                    } catch {
                        errorMsg = JSON.stringify(error);
                    }
                } else {
                    errorMsg = JSON.stringify(error);
                }
                throw (error instanceof Error ? error : new Error(errorMsg));
            }
            setUsers(data ?? []);
        } catch (err: unknown) {
            const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message : String(err);
            toast.error("Error al cargar los usuarios.", { description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void fetchUsers(); }, []);

    const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
        { accessorKey: "email", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Email <ArrowUpDown className="ml-2 h-4 w-4" /></Button>, cell: ({ row }) => <div className="font-medium">{row.original.email}</div> },
        { accessorKey: "first_name", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nombre <ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
        { accessorKey: "last_name", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Apellido <ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
        { accessorKey: "role", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Rol <ArrowUpDown className="ml-2 h-4 w-4" /></Button>, cell: ({ getValue }) => <Badge variant={getValue() === 'administrador' ? 'default' : 'secondary'} className="capitalize">{getValue() as string}</Badge> },
        { accessorKey: "can_upload_blog", header: "Puede Bloggear", cell: ({ getValue }) => getValue() ? 'Sí' : 'No' },
        { id: 'actions', header: () => <div className="text-center">Editar</div>, cell: ({ row }) => <div className="text-center"><Button variant="ghost" size="icon" onClick={() => setEditingUser(row.original)}><Edit className="h-4 w-4" /></Button></div> }
    ], []);

    const table = useReactTable({
        data: users,
        columns,
        state: { sorting, globalFilter: debouncedFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-80 w-full" /></div>;
    }
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios ({users.length})</CardTitle>
                    <CardDescription>Busca, ordena y edita los perfiles de los usuarios de la plataforma.</CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Buscar por email, nombre, rol..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-10" />
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        table={table}
                        totalPages={table.getPageCount()}
                        currentPage={table.getState().pagination.pageIndex + 1}
                        onPageChange={(page) => table.setPageIndex(page - 1)}
                    />
                </CardContent>
            </Card>
            <EditUserModal 
                isOpen={!!editingUser} 
                onClose={() => setEditingUser(null)} 
                user={editingUser} 
                onUserUpdate={() => { void fetchUsers(); }} 
            />
        </>
    );
}