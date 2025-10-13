// src/features/portfolio/components/modals/add-transaction-modal.tsx

import { useState } from 'react';
import { usePortfolio } from '../../../../hooks/use-portfolio';
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { useTransactionForm } from '../../../../hooks/use-transaction-form';
import { AddTransactionModalProps } from '../../types/portfolio.types';
import { isFutureDate, calculateFinalQuantity, calculateFinalPrice } from '../../lib/portfolio.utils';

/**
 * Modal para registrar una nueva transacción de compra de un activo.
 */
export function AddTransactionModal({ isOpen, onClose, ticker, currentPrice }: AddTransactionModalProps) {
  const { addTransaction } = usePortfolio();
  const [loading, setLoading] = useState(false);

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
    if (isFutureDate(date)) {
      toast.error("La fecha de la transacción no puede ser futura.");
      return;
    }

    setLoading(true);
    try {
      const enteredQuantity = parseFloat(quantity);
      const enteredPrice = parseFloat(price);
      
      const finalQuantityInShares = calculateFinalQuantity(enteredQuantity, isCedears, ratio);
      const finalPricePerShare = calculateFinalPrice(enteredPrice, isCedears, ratio);

      await addTransaction({
        symbol: ticker,
        quantity: finalQuantityInShares,
        purchase_price: finalPricePerShare,
        purchase_date: date,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Compra de <span className="text-primary">{ticker}</span></DialogTitle>
          <DialogDescription>Completa los datos de tu operación.</DialogDescription>
        </DialogHeader>
  <form onSubmit={e => { e.preventDefault(); void handleSubmit(e); }} className="space-y-4 pt-4">
          {ratio && (
            <div>
              <Label className="mb-2 block">Tipo de Activo</Label>
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleTypeChange('cedears')} variant={isCedears ? 'default' : 'outline'} className="flex-1">CEDEARs</Button>
                <Button type="button" onClick={() => handleTypeChange('shares')} variant={!isCedears ? 'default' : 'outline'} className="flex-1">Acciones</Button>
              </div>
              {isCedears && <p className="text-xs text-muted-foreground mt-2">Ratio: {ratio} CEDEARs = 1 Acción.</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input id="quantity" type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={isCedears ? 'Ej: 15' : 'Ej: 1.5'} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio por Unidad (USD)</Label>
              <Input id="price" type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={isCedears ? 'Ej: 17.50' : 'Ej: 175.00'} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de Compra</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar Compra"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}