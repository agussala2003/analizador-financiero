import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../../hooks/use-portfolio';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Holding } from '../../types/portfolio';
import { useCedearRatios } from '../../hooks/use-cedear-ratios';

type HoldingWithMetrics = Holding & { currentPrice: number };

interface SellTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: HoldingWithMetrics | null;
}

export function SellTransactionModal({ isOpen, onClose, holding }: SellTransactionModalProps) {
  const { addTransaction } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState('shares');
  const { ratios: cedearRatios } = useCedearRatios();
  const ratio = holding ? cedearRatios[holding.symbol] : undefined;

  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const maxShares = holding?.quantity || 0;
  const maxCedears = ratio ? maxShares * ratio : 0;
  
  const handleTypeChange = useCallback((newType: string) => {
    if (newType === inputType || !ratio) return;
    setInputType(newType);
  }, [inputType, ratio]);

  useEffect(() => {
    if (isOpen && holding) {
      if (ratio && holding.currentPrice) {
        setPrice((holding.currentPrice / ratio).toFixed(4));
        setInputType('cedears');
      } else if (holding.currentPrice) {
        setPrice(holding.currentPrice.toFixed(2));
        setInputType('shares');
      } else {
        setPrice('');
      }
      setQuantity('');
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen, holding, ratio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holding) return;

    setLoading(true);
    try {
      const enteredQuantity = parseFloat(quantity);
      if (isNaN(enteredQuantity) || enteredQuantity <= 0) {
        throw new Error("La cantidad debe ser un número positivo.");
      }

      const finalQuantityInShares = inputType === 'cedears' && ratio ? enteredQuantity / ratio : enteredQuantity;

      if (finalQuantityInShares > maxShares) {
        throw new Error(`No puedes vender más de lo que posees (${isCedears ? maxCedears.toFixed(2) : maxShares.toFixed(4)}).`);
      }
      
      const finalPricePerShare = inputType === 'cedears' && ratio ? parseFloat(price) * ratio : parseFloat(price);

      await addTransaction({
        symbol: holding.symbol,
        quantity: finalQuantityInShares,
        purchase_price: finalPricePerShare,
        purchase_date: date,
        transaction_type: 'sell',
      });
      toast.success(`Venta de ${holding.symbol} registrada.`);
      onClose();
    } catch (error: any) {
      toast.error('No se pudo registrar la venta.', { description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const isCedears = inputType === 'cedears';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vender <span className="text-primary">{holding?.symbol}</span></DialogTitle>
          <DialogDescription>
            Posees {maxShares.toFixed(4)} acciones {ratio ? `(${maxCedears.toFixed(2)} CEDEARs)` : ''}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
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