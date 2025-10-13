// src/components/dashboard/selected-tickers-list.tsx

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { XIcon } from 'lucide-react';

interface SelectedTickersListProps {
  tickers: string[];
  onRemoveTicker: (ticker: string) => void;
}

export function SelectedTickersList({ tickers, onRemoveTicker }: SelectedTickersListProps) {
  if (tickers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t">
      <AnimatePresence>
        {tickers.map((ticker) => (
          <motion.div
            key={ticker}
            layout
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-secondary text-secondary-foreground">
              <span>{ticker}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 rounded-full"
                onClick={() => onRemoveTicker(ticker)}
                aria-label={`Quitar ${ticker}`}
              >
                <XIcon className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
