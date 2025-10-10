// src/features/dashboard/components/ticker-add-form.tsx

import { useState, FormEvent } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { PlusIcon, SearchIcon } from 'lucide-react';

interface TickerAddFormProps {
  onAddTicker: (ticker: string) => void;
}

export function TickerAddForm({ onAddTicker }: TickerAddFormProps) {
  const [tickerInput, setTickerInput] = useState('');
  
  const isFetching = useIsFetching();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tickerInput) return;
    onAddTicker(tickerInput);
    setTickerInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
      <SearchIcon className="w-5 h-5 text-muted-foreground hidden sm:block" />
      <Input
        placeholder="Añadir símbolo (ej: AAPL, MELI)..."
        value={tickerInput}
        onChange={(e) => setTickerInput(e.target.value)}
        className="flex-grow"
        disabled={isFetching > 0}
      />
      <Button type="submit" disabled={isFetching > 0 || !tickerInput} className="w-full sm:w-auto">
        <PlusIcon className="w-4 h-4 mr-2" />
        {isFetching > 0 ? 'Cargando...' : 'Añadir'}
      </Button>
    </form>
  );
}