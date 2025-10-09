// src/components/dashboard/ticker-add-form.tsx

import { useState, FormEvent } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PlusIcon, SearchIcon } from 'lucide-react';

interface TickerAddFormProps {
  onAddTicker: (ticker: string) => Promise<void>;
  isLoading: boolean;
}

export function TickerAddForm({ onAddTicker, isLoading }: TickerAddFormProps) {
  const [tickerInput, setTickerInput] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tickerInput) return;
    await onAddTicker(tickerInput);
    setTickerInput('');
  };

  return (
    <form onSubmit={() => void handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
      <SearchIcon className="w-5 h-5 text-muted-foreground hidden sm:block" />
      <Input
        placeholder="Añadir símbolo (ej: AAPL, MELI)..."
        value={tickerInput}
        onChange={(e) => setTickerInput(e.target.value)}
        className="flex-grow"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !tickerInput} className="w-full sm:w-auto">
        <PlusIcon className="w-4 h-4 mr-2" />
        {isLoading ? 'Cargando...' : 'Añadir'}
      </Button>
    </form>
  );
}