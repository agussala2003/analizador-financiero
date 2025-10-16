// src/features/risk-premium/components/filters/risk-premium-filters.tsx

import { Card, CardHeader } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Search, X } from 'lucide-react';
import { RiskPremiumFiltersProps } from '../../types/risk-premium.types';

export function RiskPremiumFilters({
  countryFilter,
  continentFilter,
  continents,
  onCountryFilterChange,
  onContinentFilterChange,
  onClearFilters,
}: RiskPremiumFiltersProps) {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Country Search */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar país..."
              value={countryFilter}
              onChange={(e) => onCountryFilterChange(e.target.value)}
              className="pl-9 sm:pl-10 text-sm"
            />
          </div>

          {/* Continent Filter */}
          <Select value={continentFilter} onValueChange={onContinentFilterChange}>
            <SelectTrigger className="w-full sm:w-[220px] text-sm">
              <SelectValue placeholder="Filtrar por continente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los continentes</SelectItem>
              {continents.map((continent) => (
                <SelectItem key={continent} value={continent}>
                  {continent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Limpiar
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
