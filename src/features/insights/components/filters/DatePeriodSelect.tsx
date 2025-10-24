import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';

export interface DatePeriodSelectProps {
  value: number;
  onChange: (days: number) => void;
  className?: string;
}

/**
 * Selector de período para filtrar insights por fecha.
 * Opciones: 1 mes, 3 meses, 6 meses, 1 año.
 */
export const DatePeriodSelect: React.FC<DatePeriodSelectProps> = ({ value, onChange, className }) => {
  const options = [
    { label: '1 mes', days: 30 },
    { label: '3 meses', days: 90 },
    { label: '6 meses', days: 180 },
    { label: '1 año', days: 365 },
  ];
  return (
    <Select value={String(value)} onValueChange={v => onChange(Number(v))}>
  <SelectTrigger className={className ?? 'w-[120px]'}>
  <SelectValue>{options.find(o => o.days === value)?.label ?? 'Período'}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.days} value={String(opt.days)}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
