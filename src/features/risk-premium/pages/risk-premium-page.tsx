// src/features/risk-premium/pages/risk-premium-page.tsx

import { useEffect, useMemo, useState } from 'react';
import { useConfig } from '../../../hooks/use-config';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { errorToString } from '../../../utils/type-guards';
import { RiskPremiumData } from '../types/risk-premium.types';
import {
  fetchRiskPremiumData,
  extractContinents,
} from '../lib/risk-premium.utils';
import {
  RiskPremiumFilters,
  RiskPremiumTable,
  RiskPremiumSkeleton,
} from '../components';

export default function RiskPremiumPage() {
  const [data, setData] = useState<RiskPremiumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState('');
  const [continentFilter, setContinentFilter] = useState('');
  const config = useConfig();

  const continents = useMemo(() => extractContinents(data), [data]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const riskData = await fetchRiskPremiumData(config);
        setData(riskData);
      } catch (error: unknown) {
        toast.error('Error al obtener los datos de riesgo país.');
        console.error('Risk premium fetch error:', errorToString(error));
      } finally {
        setLoading(false);
      }
    };

    if (config) void fetchData();
  }, [config]);

  const handleClearFilters = () => {
    setCountryFilter('');
    setContinentFilter('');
  };

  if (loading) {
    return <RiskPremiumSkeleton />;
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
