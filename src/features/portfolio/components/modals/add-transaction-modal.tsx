// src/features/portfolio/components/modals/add-transaction-modal.tsx

import { useState } from 'react';
import { usePortfolio } from '../../../../hooks/use-portfolio';
import { usePortfolioLimits } from '../../../../hooks/use-portfolio-limits';
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Calendar } from "../../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../../../lib/utils";
import { toast } from "sonner";
import { useTransactionForm } from '../../../../hooks/use-transaction-form';
import { AddTransactionModalProps } from '../../types/portfolio.types';
import { isFutureDate, calculateFinalQuantity, calculateFinalPrice } from '../../lib/portfolio.utils';

/**
 * Modal para registrar una nueva transacción de compra de un activo.
 */
export function AddTransactionModal({ isOpen, onClose, ticker, currentPrice }: AddTransactionModalProps) {
  const { addTransaction, holdings } = usePortfolio();
  const [loading, setLoading] = useState(false);

  // ✅ Validar límite de activos en portfolio
  const uniqueAssets = holdings.length;
  const { isAtLimit, upgradeMessage } = usePortfolioLimits(uniqueAssets);

  // ✅ Toda la lógica del formulario ahora reside en el hook
  const {
    quantity, setQuantity,
    price, setPrice,
    date, setDate,
  handleTypeChange,
    ratio, isCedears
  } = useTransactionForm({ isOpen, ticker, currentPrice });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    
    const dateString = format(date, 'yyyy-MM-dd');
    if (isFutureDate(dateString)) {
      toast.error("La fecha de la transacción no puede ser futura.");
      return;
    }

    // ✅ Validación: Verificar límite de activos si es un activo nuevo
    const symbolExists = holdings.some(h => h.symbol === ticker);
    if (!symbolExists && isAtLimit) {
      toast.error("Límite de activos alcanzado", {
        description: `${upgradeMessage} Actualiza tu plan para agregar más activos.`,
      });
      return;
    }

    setLoading(true);
    try {
      const enteredQuantity = parseFloat(quantity);
      const enteredPrice = parseFloat(price);
      
      // ✅ Validación: Cantidad debe ser positiva
      if (isNaN(enteredQuantity) || enteredQuantity <= 0) {
        toast.error("Cantidad inválida", {
          description: "La cantidad debe ser un número positivo mayor a 0.",
        });
        setLoading(false);
        return;
      }

      // ✅ Validación: Precio debe ser positivo
      if (isNaN(enteredPrice) || enteredPrice <= 0) {
        toast.error("Precio inválido", {
          description: "El precio debe ser un número positivo mayor a 0.",
        });
        setLoading(false);
        return;
      }

      // ✅ Validación: Cantidad no puede ser extremadamente grande (límite razonable)
      if (enteredQuantity > 1000000) {
        toast.error("Cantidad muy grande", {
          description: "La cantidad no puede exceder 1,000,000 unidades.",
        });
        setLoading(false);
        return;
      }

      // ✅ Validación: Precio no puede ser extremadamente grande
      if (enteredPrice > 1000000) {
        toast.error("Precio muy alto", {
          description: "El precio no puede exceder $1,000,000 por unidad.",
        });
        setLoading(false);
        return;
      }
      
      const finalQuantityInShares = calculateFinalQuantity(enteredQuantity, isCedears, ratio);
      const finalPricePerShare = calculateFinalPrice(enteredPrice, isCedears, ratio);

      await addTransaction({
        symbol: ticker,
        quantity: finalQuantityInShares,
        purchase_price: finalPricePerShare,
        purchase_date: dateString,
        transaction_type: 'buy',
      });
      toast.success(`Compra de ${ticker} agregada a tu portafolio.`);
      onClose();
    } catch (error: unknown) {
      let message = 'Error desconocido';
      if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        message = (error as { message: string }).message;
      }
      toast.error('No se pudo agregar la transacción.', { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Agregar Compra de <span className="text-primary">{ticker}</span></DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Completa los datos de tu operación.</DialogDescription>
        </DialogHeader>
  <form onSubmit={e => { e.preventDefault(); void handleSubmit(e); }} className="space-y-3 sm:space-y-4 pt-4">
          {ratio && (
            <div>
              <Label className="mb-2 block text-xs sm:text-sm">Tipo de Activo</Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => handleTypeChange('cedears')} variant={isCedears ? 'default' : 'outline'} className="flex-1 text-xs sm:text-sm">CEDEARs</Button>
                <Button type="button" size="sm" onClick={() => handleTypeChange('shares')} variant={!isCedears ? 'default' : 'outline'} className="flex-1 text-xs sm:text-sm">Acciones</Button>
              </div>
              {isCedears && <p className="text-xs text-muted-foreground mt-2">Ratio: {ratio} CEDEARs = 1 Acción.</p>}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="quantity" className="text-xs sm:text-sm">Cantidad</Label>
              <Input 
                id="quantity" 
                type="number" 
                step="any" 
                min="0.0001"
                max="1000000"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                placeholder={isCedears ? 'Ej: 15' : 'Ej: 1.5'} 
                required 
                autoFocus
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="price" className="text-xs sm:text-sm">Precio por Unidad (USD)</Label>
              <Input 
                id="price" 
                type="number" 
                step="any" 
                min="0.01"
                max="1000000"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder={isCedears ? 'Ej: 17.50' : 'Ej: 175.00'} 
                required
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Fecha de Compra</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal text-xs sm:text-sm",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="w-full sm:w-auto text-xs sm:text-sm">Cancelar</Button>
            <Button type="submit" size="sm" disabled={loading} className="w-full sm:w-auto text-xs sm:text-sm">{loading ? "Guardando..." : "Guardar Compra"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}