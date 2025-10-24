import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';

export interface LimitSelectProps {
  value: number;
  onChange: (limit: number) => void;
  options?: number[];
  className?: string;
}

/**
 * Selector de cantidad de resultados para insights.
 */
export const LimitSelect: React.FC<LimitSelectProps> = ({ value, onChange, options = [5, 10, 20, 50], className }) => (
  <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
  <SelectTrigger className={className ?? 'w-[100px]'}>
      <SelectValue>{value} resultados</SelectValue>
    </SelectTrigger>
    <SelectContent>
      {options.map(opt => (
        <SelectItem key={opt} value={String(opt)}>{opt} resultados</SelectItem>
      ))}
    </SelectContent>
  </Select>
);
