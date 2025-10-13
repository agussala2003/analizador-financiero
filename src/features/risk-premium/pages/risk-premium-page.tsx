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
      className="container-wide stack-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 section-divider">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="heading-2">
              Riesgo País
            </h1>
            <p className="body text-muted-foreground">
              Consulta la prima de riesgo país y la prima total de acciones por
              país.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <RiskPremiumFilters
        countryFilter={countryFilter}
        continentFilter={continentFilter}
        continents={continents}
        onCountryFilterChange={setCountryFilter}
        onContinentFilterChange={setContinentFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <RiskPremiumTable
        data={data}
        countryFilter={countryFilter}
        continentFilter={continentFilter}
      />
    </motion.div>
  );
}
