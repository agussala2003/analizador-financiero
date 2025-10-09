// src/components/portfolio/sell-transaction-modal.tsx

import { useState } from 'react';
import { usePortfolio } from '../../hooks/use-portfolio';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { HoldingWithMetrics } from '../../types/portfolio';
import { useTransactionForm } from '../../hooks/use-transaction-form'; // ✅ Importamos el mismo hook

interface SellTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: HoldingWithMetrics | null;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding) return;

    setLoading(true);
    try {
      const enteredQuantity = parseFloat(quantity);
      if (isNaN(enteredQuantity) || enteredQuantity <= 0) {
        throw new Error("La cantidad debe ser un número positivo.");
      }

      const finalQuantityInShares = isCedears && ratio ? enteredQuantity / ratio : enteredQuantity;

      if (finalQuantityInShares > maxShares + 1e-9) { // Pequeña tolerancia para errores de punto flotante
        throw new Error(`No puedes vender más de lo que posees (${isCedears ? maxCedears.toFixed(2) : maxShares.toFixed(4)}).`);
      }
      
      const finalPricePerShare = isCedears && ratio ? parseFloat(price) * ratio : parseFloat(price);

      await addTransaction({
        symbol: holding.symbol,
        quantity: finalQuantityInShares,
        purchase_price: finalPricePerShare,
        purchase_date: date,
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
            <Label htmlFor="date-sell">Fecha de Venta</Label>
            <Input id="date-sell" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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