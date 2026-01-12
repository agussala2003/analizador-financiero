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
import { Search, X, Percent, Hash } from 'lucide-react';
import { RiskPremiumFiltersProps } from '../../types/risk-premium.types';

export function RiskPremiumFilters({
  countryFilter,
  continentFilter,
  viewMode,
  continents,
  onCountryFilterChange,
  onContinentFilterChange,
  onViewModeChange,
  onClearFilters,
}: RiskPremiumFiltersProps) {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
          {/* Country Search */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar país..."
              value={countryFilter}
              onChange={(e) => onCountryFilterChange(e.target.value)}
              className="pl-9 sm:pl-10 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Continent Filter */}
            <Select value={continentFilter} onValueChange={onContinentFilterChange}>
              <SelectTrigger className="w-full sm:w-[200px] text-sm">
                <SelectValue placeholder="Continente" />
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

            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-md p-1 gap-1">
              <Button
                variant={viewMode === 'percentage' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('percentage')}
                className="flex-1 sm:w-auto h-8 text-xs px-3"
              >
                <Percent className="w-3.5 h-3.5 mr-1.5" />
                Porcentaje
              </Button>
              <Button
                variant={viewMode === 'points' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('points')}
                className="flex-1 sm:w-auto h-8 text-xs px-3"
              >
                <Hash className="w-3.5 h-3.5 mr-1.5" />
                Puntos
              </Button>
            </div>

            {/* Clear Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}