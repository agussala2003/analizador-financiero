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
import { Search, TrendingUp, Wallet, FileText, Calculator, Newspaper, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Holding } from "../../types/portfolio";
import { searchAssets, type SearchResult } from "../../services/api/search-api";
import { useConfig } from "../../hooks/use-config";

/**
 * Global Command Menu (Ctrl+K / Cmd+K)
 * Permite búsqueda rápida de páginas y acciones
 */
export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const navigate = useNavigate();
  const config = useConfig();
  
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

  // ✅ Búsqueda de activos con debounce
  React.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      void searchAssets(searchQuery, config, 8)
        .then((results) => {
          setSearchResults(results);
          setIsSearching(false);
        })
        .catch(() => {
          setSearchResults([]);
          setIsSearching(false);
        });
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery, config]);

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
        className="inline-flex items-center gap-2 px-3 py-2 body-sm text-muted-foreground border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="caption">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog 
        open={open} 
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            // Limpiar búsqueda al cerrar
            setSearchQuery("");
            setSearchResults([]);
          }
        }}
      >
        <CommandInput 
          placeholder="Buscar activos, páginas..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? "Buscando..." : "No se encontraron resultados."}
          </CommandEmpty>

          {/* ✅ Resultados de Búsqueda de Activos */}
          {searchResults.length > 0 && (
            <>
              <CommandGroup heading="Activos">
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.symbol}
                    onSelect={() => {
                      setOpen(false);
                      setSearchQuery("");
                      void navigate(`/asset/${result.symbol}`);
                    }}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.symbol}</span>
                        {result.isAvailable ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                        )}
                      </div>
                      <span className="caption text-muted-foreground">
                        {result.name} · {result.exchangeShortName}
                        {!result.isAvailable && " · Datos no disponibles"}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

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
                    <span className="ml-auto caption text-muted-foreground">
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
