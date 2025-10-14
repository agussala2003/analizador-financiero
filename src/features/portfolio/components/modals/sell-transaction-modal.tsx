// src/features/portfolio/components/modals/sell-transaction-modal.tsx

import { useState } from 'react';
import { usePortfolio } from '../../../../hooks/use-portfolio';
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { useTransactionForm } from '../../../../hooks/use-transaction-form';
import { SellTransactionModalProps } from '../../types/portfolio.types';
import { calculateFinalQuantity, calculateFinalPrice } from '../../lib/portfolio.utils';

import { Calendar } from "../../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../../../lib/utils";
import { useEffect } from 'react';

/**
 * Modal para registrar una transacción de venta de un activo existente en el portafolio.
 */
export function SellTransactionModal({ isOpen, onClose, holding }: SellTransactionModalProps) {
  const { addTransaction } = usePortfolio();
  const [loading, setLoading] = useState(false);

  // ✅ Reutilizamos el hook para manejar el estado del formulario
  const {
    quantity, setQuantity,
    price, setPrice,
    date, setDate,
    handleTypeChange,
    ratio, isCedears,
  } = useTransactionForm({ 
    isOpen, 
    ticker: holding?.symbol ?? null,
    currentPrice: holding?.currentPrice ?? null
  });

  const maxShares = holding?.quantity ?? 0;
  const maxCedears = ratio ? maxShares * ratio : 0;

  // Autocompletar cantidad máxima cuando se abre el modal
  useEffect(() => {
    if (isOpen && holding) {
      const maxQuantity = isCedears ? maxCedears : maxShares;
      setQuantity(maxQuantity.toString());
    }
  }, [isOpen, holding, isCedears, maxShares, maxCedears, setQuantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding) return;

    const dateString = format(date, 'yyyy-MM-dd');

    setLoading(true);
    try {
      const enteredQuantity = parseFloat(quantity);
      if (isNaN(enteredQuantity) || enteredQuantity <= 0) {
        throw new Error("La cantidad debe ser un número positivo.");
      }

      const finalQuantityInShares = calculateFinalQuantity(enteredQuantity, isCedears, ratio);

      if (finalQuantityInShares > maxShares + 1e-9) {
        throw new Error(`No puedes vender más de lo que posees (${isCedears ? maxCedears.toFixed(2) : maxShares.toFixed(4)}).`);
      }
      
      const finalPricePerShare = calculateFinalPrice(parseFloat(price), isCedears, ratio);

      await addTransaction({
        symbol: holding.symbol,
        quantity: finalQuantityInShares,
        purchase_price: finalPricePerShare,
        purchase_date: dateString,
        transaction_type: 'sell',
      });
      toast.success(`Venta de ${holding.symbol} registrada.`);
      onClose();
    } catch (error: unknown) {
      let message = 'Error desconocido';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        message = (error as { message: string }).message;
      }
      toast.error('No se pudo registrar la venta.', { description: message });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vender <span className="text-primary">{holding?.symbol}</span></DialogTitle>
          <DialogDescription>
            Posees {maxShares.toFixed(4)} acciones {ratio ? `(~${maxCedears.toFixed(2)} CEDEARs)` : ''}.
          </DialogDescription>
        </DialogHeader>
  <form onSubmit={e => { e.preventDefault(); void handleSubmit(e); }} className="space-y-4 pt-4">
          {ratio && (
            <div>
              <Label className="mb-2 block">Vender como</Label>
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleTypeChange('cedears')} variant={isCedears ? 'default' : 'outline'} className="flex-1">CEDEARs</Button>
                <Button type="button" onClick={() => handleTypeChange('shares')} variant={!isCedears ? 'default' : 'outline'} className="flex-1">Acciones</Button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity-sell">Cantidad a Vender</Label>
              <Input id="quantity-sell" type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} max={isCedears ? maxCedears : maxShares} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price-sell">Precio de Venta (USD)</Label>
              <Input id="price-sell" type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha de Venta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[270px] p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  locale={es}
                  className='w-[270px]'
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} variant="destructive">{loading ? "Registrando..." : "Confirmar Venta"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}