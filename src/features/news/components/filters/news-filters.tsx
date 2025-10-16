// src/features/news/components/filters/news-filters.tsx

import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { ListFilter, X } from "lucide-react";
import { NewsFiltersProps } from "../../types/news.types";

/**
 * Barra de filtros para noticias
 * Permite filtrar por símbolo y compañía con un botón para limpiar
 */
export const NewsFilters = ({
  symbolFilter,
  onSymbolFilterChange,
  companyFilter,
  onCompanyFilterChange,
  onClearFilters,
}: NewsFiltersProps) => {
  return (
    <Card className="mb-6 sm:mb-8 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <ListFilter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hidden sm:block" />
        <Input
          placeholder="Filtrar por Símbolo..."
          value={symbolFilter}
          onChange={(e) => onSymbolFilterChange(e.target.value)}
          className="w-full sm:w-auto text-sm"
        />
        <Input
          placeholder="Filtrar por Compañía..."
          value={companyFilter}
          onChange={(e) => onCompanyFilterChange(e.target.value)}
          className="w-full sm:w-auto text-sm"
        />
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm">
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Limpiar
        </Button>
      </div>
    </Card>
  );
};
