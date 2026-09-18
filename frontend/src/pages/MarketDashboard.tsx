import { useEffect, useState, } from 'react';
import MarketFilters from '../components/MarketFilters';
import MarketSummary from '../components/MarketSummary';
import MarketRanking from '../components/MarketRanking';
import AgeDistributionChart from '../components/AgeDistributionChart';
import { getMunicipalities } from '../services/locations';
import {getMarketData,getMarketDataSummary, } from '../services/market-data';
import type { Municipality } from '../types/location';
import type {MarketData, MarketDataSummary, } from '../types/market-data';
import type {MarketFilters as MarketFiltersState,} from '../types/market-filters';
import './MarketDashboard.css';
import MarketRankingPosition from '../components/MarketRankingPosition';

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

  const [rankingData, setRankingData] =
    useState<MarketData[]>([]);

  const [marketSummary, setMarketSummary] =
    useState<MarketDataSummary | null>(null);

  const [municipalities, setMunicipalities] =
    useState<Municipality[]>([]);

  const [filters, setFilters] =
    useState<MarketFiltersState>(initialFilters);

  const [appliedFilters, setAppliedFilters] =
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

        const marketResponse =
  await getMarketData(appliedFilters);

const summaryResponse =
  await getMarketDataSummary(appliedFilters);

        setMarketData(marketResponse.data);
        setMarketSummary(summaryResponse);

        if (appliedFilters.municipality) {
          const rankingResponse = await getMarketData({
            ...appliedFilters,
            municipality: '',
          });

          setRankingData(rankingResponse.data);
        } else {
          setRankingData(marketResponse.data);
        }
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
  }, [appliedFilters]);

  useEffect(() => {
    async function loadMunicipalities() {
      if (!filters.state) {
        setMunicipalities([]);
        return;
      }

      try {
        const data = await getMunicipalities(filters.state);

        setMunicipalities(data);
      } catch (error) {
        console.error(
          'Erro ao carregar municípios:',
          error,
        );

        setMunicipalities([]);
      }
    }

    loadMunicipalities();
  }, [filters.state]);

  return (
    <main className="market-dashboard">
      <header className="dashboard-header">
        <h1>Painel de Inteligência de Mercado</h1>

        <p>
          Análise de mercado por região e público.
        </p>
      </header>

      <MarketFilters
        filters={filters}
        municipalities={municipalities}
        onChange={setFilters}
        onAnalyze={() =>
          setAppliedFilters(filters)
        }
      />

      {isLoading && (
        <section className="dashboard-state">
          <p>Carregando dados de mercado...</p>
        </section>
      )}

      {!isLoading && error && (
        <section className="dashboard-state dashboard-error">
          <p>{error}</p>
        </section>
      )}

      {!isLoading && !error && (
        <div className="dashboard-content">
          {marketSummary && (
            <MarketSummary
              summary={marketSummary}
              ageGroup={appliedFilters.ageGroup}
              state={appliedFilters.state}
              municipality={appliedFilters.municipality}
            />
          )}

          <div className="dashboard-charts">
            <div className="market-ranking-wrapper">
              <MarketRanking
                data={rankingData}
                sortBy={appliedFilters.sortBy}
                selectedMunicipality={appliedFilters.municipality}
                onSelectMunicipality={(municipality) => {
                  setFilters((current) => ({
                    ...current,
                    municipality,
                  }));

                  setAppliedFilters((current) => ({
                    ...current,
                    municipality,
                  }));
                }}
              />

              {appliedFilters.municipality && marketData[0] && (
                <MarketRankingPosition
                  marketData={marketData[0]}
                  sortBy={appliedFilters.sortBy}
                  state={marketData[0].state ?? ''}
                />
              )}
            </div>

            <AgeDistributionChart
              data={marketData}
              selectedAgeGroup={appliedFilters.ageGroup}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default MarketDashboard;