import { Button } from "../components/ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { logger } from "../lib/logger";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import React from "react";
import { useAuth } from "../hooks/use-auth";

export function EditProfileModal({ onClose }: { onClose: () => void }) { // Recibe onClose como prop
    const { user, refreshProfile, profile } = useAuth(); // Obtén el usuario y la función de refresco del perfil
    const [name, setName] = React.useState('');
    const [surname, setSurname] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // Usa el usuario del hook de auth, no de las props
    React.useEffect(() => {
        setName(profile?.first_name || '');
        setSurname(profile?.last_name || '');
    }, [user]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('profiles').update({
                first_name: name.trim(),
                last_name: surname.trim()
            }).eq('id', user!.id);

            if (error) throw error;

            // Llama a refreshProfile para actualizar el estado global
            await refreshProfile();

            logger.info('PROFILE_UPDATE_SUCCESS', 'Perfil actualizado exitosamente', {
                userId: user!.id,
                firstName: name.trim(),
                lastName: surname.trim()
            });

            toast.success('¡Perfil actualizado con éxito!');
            onClose(); // Cierra el modal solo si el proceso fue exitoso
        } catch (error: any) {
            logger.error('PROFILE_UPDATE_FAILED', 'Error al actualizar perfil', {
                userId: user!.id,
                error: error.message,
                firstName: name.trim(),
                lastName: surname.trim()
            });
            toast.error('No se pudo actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <DialogContent className="w-11/12 sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                        Haz cambios en tu perfil aquí. Guarda cuando hayas terminado.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Nombre</Label>
                        <Input id="name-1" name="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="surname-1">Apellido</Label>
                        <Input id="surname-1" name="surname" value={surname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}