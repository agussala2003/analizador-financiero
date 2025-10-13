// src/components/search/command-menu.tsx

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Search, TrendingUp, Wallet, FileText, Calculator, Newspaper } from "lucide-react";
import type { Holding } from "../../types/portfolio";

/**
 * Global Command Menu (Ctrl+K / Cmd+K)
 * Permite búsqueda rápida de páginas y acciones
 */
export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  
  // Por ahora sin datos del portfolio - se puede agregar después
  const holdings: Holding[] = [];

  // Toggle con Ctrl+K o Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Quick actions
  const quickActions = [
    {
      icon: TrendingUp,
      label: "Dashboard",
      action: () => navigate("/dashboard"),
    },
    {
      icon: Wallet,
      label: "Mi Portfolio",
      action: () => navigate("/portfolio"),
    },
    {
      icon: FileText,
      label: "Dividendos",
      action: () => navigate("/dividends"),
    },
    {
      icon: Calculator,
      label: "Calculadora de Retiro",
      action: () => navigate("/retirement-calculator"),
    },
    {
      icon: Newspaper,
      label: "Noticias",
      action: () => navigate("/news"),
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar assets, páginas..." />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Acciones Rápidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={() => {
                  setOpen(false);
                  void action.action();
                }}
              >
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Portfolio Holdings */}
          {holdings && holdings.length > 0 && (
            <>
              <CommandGroup heading="Mi Portfolio">
                {holdings.slice(0, 5).map((holding: Holding) => (
                  <CommandItem
                    key={holding.symbol}
                    onSelect={() => {
                      setOpen(false);
                      void navigate(`/asset/${holding.symbol}`);
                    }}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>{holding.symbol}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {holding.quantity} acciones
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}


        </CommandList>
      </CommandDialog>
    </>
  );
}
