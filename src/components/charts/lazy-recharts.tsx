// src/components/charts/lazy-recharts.tsx

import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Centralized lazy loading for Recharts components.
 * This optimizes bundle size by:
 * 1. Lazy loading chart containers (heavy components)
 * 2. Tree-shaking unused recharts modules
 * 3. Code splitting recharts into separate chunks
 * 
 * Usage: Import from this file instead of 'recharts' directly
 */

// Chart loading fallback
const ChartSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center">
    <Skeleton className="w-full h-full rounded-lg" />
  </div>
);

// === Lazy load HEAVY chart container components ===
const LazyPieChart = lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);

const LazyBarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);

const LazyAreaChart = lazy(() => 
  import('recharts').then(module => ({ default: module.AreaChart }))
);

const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);

const LazyRadarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.RadarChart }))
);

// === Wrapped components with Suspense ===
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PieChart: ComponentType<any> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyPieChart {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BarChart: ComponentType<any> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyBarChart {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AreaChart: ComponentType<any> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyAreaChart {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LineChart: ComponentType<any> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyLineChart {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RadarChart: ComponentType<any> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyRadarChart {...props} />
  </Suspense>
);

// === Re-export lightweight components (these don't add much weight) ===
// These are actual chart elements, not containers
export {
  // Chart elements
  Pie,
  Bar,
  Area,
  Line,
  Cell,
  Radar,
  
  // Axes and grids
  XAxis,
  YAxis,
  CartesianGrid,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  
  // Layout and utilities
  Legend,
  ResponsiveContainer,
  LabelList,
  Tooltip,
} from 'recharts';
