import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';

export interface SortSelectProps {
  value: string;
  onChange: (sort: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}

/**
 * Selector de ordenamiento para insights.
 */
export const SortSelect: React.FC<SortSelectProps> = ({ value, onChange, options, className }) => (
  <Select value={value} onValueChange={onChange}>
  <SelectTrigger className={className ?? 'w-[180px]'}>
  <SelectValue>{options.find(o => o.value === value)?.label ?? 'Ordenar por'}</SelectValue>
    </SelectTrigger>
    <SelectContent>
      {options.map(opt => (
        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);
