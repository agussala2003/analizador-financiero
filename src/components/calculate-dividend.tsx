import { Banknote, Calendar } from "lucide-react";
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
import React from "react";

// Definiendo un tipo para los datos del dividendo para mayor claridad
type Dividend = {
    symbol: string;
    dividend: number;
    paymentDate: string;
};

// Se reciben las props de forma destructurada para un código más limpio
export function CalculateDividendModal({ dividend }: { dividend: Dividend }) {
    const [nominales, setNominales] = React.useState('');

    // Se calcula el total en una variable para mantener el JSX más legible
    const totalEstimado = (parseFloat(nominales) || 0) * (dividend?.dividend || 0);

    return (
        <DialogContent className="w-11/12 sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>
                    Calcular Dividendo para <span className="text-primary">{dividend?.symbol}</span>
                </DialogTitle>
                <DialogDescription>
                    Ingresa la cantidad de acciones que posees para estimar tu ganancia.
                </DialogDescription>
            </DialogHeader>

            {/* Usamos space-y para un espaciado vertical consistente */}
            <div className="grid gap-6 py-4">
                
                {/* --- SECCIÓN DE ENTRADA DEL USUARIO --- */}
                <div className="grid gap-2">
                    <Label htmlFor="nominales-input" className="font-semibold">Cantidad de Acciones</Label>
                    <Input
                        id="nominales-input"
                        type="number" // Usar tipo 'number' es mejor para valores numéricos
                        placeholder="Ej: 100"
                        min="0"
                        value={nominales}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNominales(e.target.value)}
                        className="col-span-3 text-base"
                    />
                </div>

                {/* --- SECCIÓN DE DATOS INFORMATIVOS --- */}
                <div className="p-4 space-y-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            <Banknote className="inline size-4 mr-1 text-chart-2" /> Dividendo por Acción
                        </span>
                        <span className="font-semibold">${dividend?.dividend?.toFixed(4) || '0.00'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            <Calendar className="inline size-4 mr-1 text-chart-3" /> Fecha de Pago
                        </span>
                        <span className="font-semibold">
                            {dividend?.paymentDate ? new Date(dividend.paymentDate).toLocaleDateString("es-ES") : '-'}
                        </span>
                    </div>
                </div>

                {/* --- SECCIÓN DEL RESULTADO FINAL CON ÉNFASIS --- */}
                <div className="p-4 text-center border-2 border-green-500 rounded-lg bg-green-50">
                    <Label className="text-sm font-semibold text-green-800">TOTAL ESTIMADO A RECIBIR</Label>
                    <div className="mt-1 text-3xl font-bold tracking-tight text-green-700">
                        ${totalEstimado.toFixed(2)}
                    </div>
                </div>

            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" type="button">Cerrar</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}