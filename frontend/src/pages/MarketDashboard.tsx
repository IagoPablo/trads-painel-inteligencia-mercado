import { useEffect, useState } from 'react';

import MarketFilters from '../components/MarketFilters';
import MarketSummary from '../components/MarketSummary';
import MarketRanking from '../components/MarketRanking';
import AgeDistributionChart from '../components/AgeDistributionChart';

import {
  getMarketData,
  getMarketDataSummary,
} from '../services/market-data';

import type {
  MarketData,
  MarketDataSummary,
} from '../types/market-data';

import type {
  MarketFilters as MarketFiltersState,
} from '../types/market-filters';

const initialFilters: MarketFiltersState = {
  state: '',
  municipality: '',
  ageGroup: '',
  sortBy: 'population',
  order: 'desc',
};

function MarketDashboard() {
  const [marketData, setMarketData] =
    useState<MarketData[]>([]);

  const [marketSummary, setMarketSummary] =
    useState<MarketDataSummary | null>(null);

  const [filters, setFilters] =
    useState<MarketFiltersState>(initialFilters);

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    async function loadMarketData() {
      try {
        setIsLoading(true);
        setError(null);

        const [marketResponse, summaryResponse] =
          await Promise.all([
            getMarketData(filters),
            getMarketDataSummary(filters),
          ]);

        setMarketData(marketResponse.data);
        setMarketSummary(summaryResponse);
      } catch (error) {
        console.error(
          'Erro ao carregar dados de mercado:',
          error,
        );

        setError(
          'Não foi possível carregar os dados de mercado.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMarketData();
  }, [filters]);

  return (
    <main>
      <h1>Painel de Inteligência de Mercado</h1>

      <p>
        Análise de mercado por região e público.
      </p>

      <MarketFilters
        filters={filters}
        onChange={setFilters}
      />

      {isLoading && (
        <p>Carregando dados de mercado...</p>
      )}

      {!isLoading && error && (
        <p>{error}</p>
      )}

      {!isLoading && !error && (
        <>
          {marketSummary && (
            <MarketSummary
              summary={marketSummary}
              ageGroup={filters.ageGroup}
            />
          )}

          <MarketRanking
            data={marketData}
            sortBy={filters.sortBy}
          />

          <AgeDistributionChart
            data={marketData}
            selectedAgeGroup={filters.ageGroup}
          />
        </>
      )}
    </main>
  );
}

export default MarketDashboard;