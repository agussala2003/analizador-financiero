// src/features/dashboard/components/ticker-input/ticker-add-form.tsx

import { useState, useEffect } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { Button } from '../../../../components/ui/button';
import { PlusIcon, SearchIcon, Check } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { cn } from "../../../../lib/utils";
import { searchAssets, SearchResult } from '../../../../services/api/search-api';
import { useConfig } from '../../../../hooks/use-config';

interface TickerAddFormProps {
  onAddTicker: (ticker: string) => void;
}

export function TickerAddForm({ onAddTicker }: TickerAddFormProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(""); // The selected symbol
  const [inputValue, setInputValue] = useState(""); // The typed text
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const isFetching = useIsFetching();
  const config = useConfig();

  // Debounced search
  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        // Use the newly enhanced searchAssets that supports Name Search + CIK/ISIN
        const data = await searchAssets(inputValue, config, 10);
        setResults(data);
      } catch (error) {
        console.error("Error searching assets:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce slightly longer to avoid too many API calls

    return () => clearTimeout(timeoutId);
  }, [inputValue, config]);

  const handleSelect = (val: string) => {
    // CommandItem value is sometimes lowercased by default logic, 
    // but we pass `value={result.symbol}`.
    // We try to find the match in results to get correct casing and symbol.
    const selected = results.find(r => r.symbol.toUpperCase() === val.toUpperCase());
    const ticker = selected ? selected.symbol : val; // fallback

    onAddTicker(ticker);
    setOpen(false);
    setValue("");
    setInputValue("");
    setResults([]);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-muted-foreground"
            disabled={isFetching > 0}
          >
            {/* Show a placeholder-like text always since we add immediately on select */}
            {"Buscar activo (ej: Apple, TSLA)..."}
            <SearchIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Escribe símbolo o nombre..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {loading && <div className="py-6 text-center text-sm text-muted-foreground">Buscando...</div>}

              {!loading && results.length === 0 && inputValue.length >= 2 && (
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              )}

              {!loading && results.map((result) => (
                <CommandItem
                  key={result.symbol}
                  value={result.symbol}
                  onSelect={() => handleSelect(result.symbol)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === result.symbol ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col w-full overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.symbol}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{result.exchangeShortName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate" title={result.name}>
                      {result.name}
                    </span>
                  </div>
                </CommandItem>
              ))}

              {/* Manual Add Option */}
              {!loading && inputValue.length > 0 && !results.some(r => r.symbol === inputValue.toUpperCase()) && (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground bg-muted/50 font-medium">Acciones</div>
                  <CommandItem
                    value={inputValue}
                    onSelect={() => handleSelect(inputValue)}
                    className="cursor-pointer"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Añadir "{inputValue.toUpperCase()}" manualmente
                  </CommandItem>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
