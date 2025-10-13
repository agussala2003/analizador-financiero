// src/features/risk-premium/pages/risk-premium-page.tsx

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { extractContinents } from '../lib/risk-premium.utils';
import { RiskPremiumFilters, RiskPremiumTable, RiskPremiumSkeleton } from '../components';
import { useRiskPremiumQuery } from '../hooks/use-risk-premium-query';
import { ErrorScreen } from '../../../components/ui/error-screen';

export default function RiskPremiumPage() {
  const [countryFilter, setCountryFilter] = useState('');
  const [continentFilter, setContinentFilter] = useState('');

  // Use TanStack Query hook
  const { data = [], isLoading, isError, error, refetch } = useRiskPremiumQuery();

  const continents = useMemo(() => extractContinents(data), [data]);

  const handleClearFilters = () => {
    setCountryFilter('');
    setContinentFilter('');
  };

  if (isLoading) {
    return <RiskPremiumSkeleton />;
  }

  if (isError) {
    return (
      <ErrorScreen
        title="Error al Cargar Datos"
        message={error instanceof Error ? error.message : 'No se pudieron obtener los datos de riesgo país.'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <motion.div
      className="container px-4 py-10 mx-auto sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 pb-4 mb-6 border-b">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Riesgo País
            </h1>
            <p className="text-muted-foreground">
              Consulta la prima de riesgo país y la prima total de acciones por
              país.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="mb-6">
        <RiskPremiumFilters
          countryFilter={countryFilter}
          continentFilter={continentFilter}
          continents={continents}
          onCountryFilterChange={setCountryFilter}
          onContinentFilterChange={setContinentFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Table */}
      <RiskPremiumTable
        data={data}
        countryFilter={countryFilter}
        continentFilter={continentFilter}
      />
    </motion.div>
  );
}
