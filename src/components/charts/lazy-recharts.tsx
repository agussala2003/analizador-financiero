// src/components/charts/lazy-recharts.tsx

import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Lazy loading wrappers for heavy Recharts components.
 * This helps reduce initial bundle size by loading charts only when needed.
 */

// Chart loading fallback
const ChartSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center">
    <Skeleton className="w-full h-full rounded-lg" />
  </div>
);

// Lazy load chart components
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

// Wrapped components with Suspense
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

// Re-export commonly used components that don't add much weight
export {
  Pie,
  Bar,
  Area,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
