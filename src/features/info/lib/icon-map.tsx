// src/features/info/lib/icon-map.tsx

import { Brain, ChartArea, Coins, GitCompare, Heart, Newspaper, Radar, Unlock } from 'lucide-react';
import type { IconName } from '../types/info-config.types';

/**
 * Mapeo de nombres de iconos a componentes de lucide-react.
 * Los iconos se usan en las tarjetas de características de la página de información.
 */
export const iconMap: Record<IconName, React.ReactNode> = {
  Brain: <Brain className="w-6 h-6 text-primary" />,
  ChartArea: <ChartArea className="w-6 h-6 text-primary" />,
  Coins: <Coins className="w-6 h-6 text-primary" />,
  GitCompare: <GitCompare className="w-6 h-6 text-primary" />,
  Heart: <Heart className="w-6 h-6 text-primary" />,
  Newspaper: <Newspaper className="w-6 h-6 text-primary" />,
  Radar: <Radar className="w-6 h-6 text-primary" />,
  Unlock: <Unlock className="w-6 h-6 text-primary" />,
} as const;

/**
 * Retorna el icono correspondiente al nombre, o un icono por defecto si no existe.
 * @param iconName - Nombre del icono a obtener
 * @returns El componente React del icono
 */
export function getIcon(iconName: string): React.ReactNode {
  return iconMap[iconName as IconName] ?? <ChartArea className="w-6 h-6 text-primary" />;
}
