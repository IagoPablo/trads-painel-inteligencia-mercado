import { useEffect, useState } from "react";

import MarketFilters from "../components/MarketFilters";
import MarketSummary from "../components/MarketSummary";
import MarketRanking from "../components/MarketRanking";
import PopulationAgeChart from "../components/PopulationAgeChart";
import AnsAgeDistributionChart from "../components/AnsAgeDistributionChart";
import { getMunicipalities } from "../services/locations";

import {
  getMarketAnalysis,
  getMarketData,
  getMarketDataSummary,
} from "../services/market-data";

import type {
  MarketAnalysis,
  MarketData,
  MarketDataSummary,
} from "../types/market-data";

import type { Municipality } from "../types/location";
import {
  type AgeGroup,
  type MarketFilters as MarketFiltersState,
  IBGE_STATE_CODE_TO_UF,
} from "../types/market-filters";

import "./MarketDashboard.css";

import MarketRankingPosition from "../components/MarketRankingPosition";
import MarketAnalysisSummary from "../components/MarketAnalysisSummary";

const initialFilters: MarketFiltersState = {
  state: "",
  municipality: "",
  ageGroup: "",
  sortBy: "population",
  order: "desc",
};

function MarketDashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);

  const [rankingData, setRankingData] = useState<MarketData[]>([]);

  const [marketSummary, setMarketSummary] = useState<MarketDataSummary | null>(
    null,
  );

  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(
    null,
  );

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  const [filters, setFilters] = useState<MarketFiltersState>(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<MarketFiltersState>(initialFilters);

  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMarketData() {
      try {
        setIsLoading(true);
        setError(null);

        const marketResponse = await getMarketData(appliedFilters);

        const summaryResponse = await getMarketDataSummary(appliedFilters);

        setMarketData(marketResponse.data);
        setMarketSummary(summaryResponse);

        if (appliedFilters.municipality) {
          const selectedMunicipality = marketResponse.data[0];

          if (!selectedMunicipality) {
            throw new Error("Município selecionado não encontrado.");
          }

          const analysisResponse = await getMarketAnalysis(
            selectedMunicipality.ibgeCode,
          );

          setMarketAnalysis(analysisResponse);

          const rankingResponse = await getMarketData({
            ...appliedFilters,
            municipality: "",
          });

          setRankingData(rankingResponse.data);
        } else {
          setMarketAnalysis(null);
          setRankingData(marketResponse.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de mercado:", error);

        setError("Não foi possível carregar os dados de mercado.");
        setMarketAnalysis(null);
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
        console.error("Erro ao carregar municípios:", error);

        setMunicipalities([]);
      }
    }

    loadMunicipalities();
  }, [filters.state]);

  const selectedAgeGroup = appliedFilters.ageGroup as AgeGroup | "";

  const selectedAgeGroupPopulation =
    marketSummary && selectedAgeGroup
      ? marketSummary.ageGroups[selectedAgeGroup]
      : null;

  const scrollToDashboardTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <button
            type="button"
            className="dashboard-brand-button"
            onClick={() => {
              setFilters(initialFilters);
              setAppliedFilters(initialFilters);
            }}
            aria-label="Voltar ao início"
          >
            <img
              src="/Tradsmarket.svg"
              alt=""
              className="dashboard-brand-mark"
            />

            <div className="dashboard-brand">
              <strong>TRADS</strong>
              <span>Inteligência de Mercado</span>
            </div>
          </button>
        </div>
      </header>

      <main className="market-dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Painel de Inteligência de Mercado</h1>

            <p>Análise de mercado por região e público.</p>
          </div>
        </header>

        <MarketFilters
          filters={filters}
          municipalities={municipalities}
          onChange={setFilters}
          onAnalyze={() => setAppliedFilters(filters)}
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
            {marketAnalysis ? (
              <MarketAnalysisSummary
                data={marketAnalysis}
                ageGroup={selectedAgeGroup}
                ageGroupPopulation={selectedAgeGroupPopulation}
              />
            ) : (
              marketSummary && (
                <MarketSummary
                  summary={marketSummary}
                  ageGroup={appliedFilters.ageGroup}
                  state={appliedFilters.state}
                  municipality={appliedFilters.municipality}
                />
              )
            )}

            <div className="dashboard-charts">
              <div className="market-ranking-wrapper">
                <MarketRanking
                  data={rankingData}
                  sortBy={appliedFilters.sortBy}
                  selectedMunicipality={appliedFilters.municipality}
                  onSelectMunicipality={(selectedMunicipality) => {
                    const stateCode = selectedMunicipality.stateCode
                      ? IBGE_STATE_CODE_TO_UF[selectedMunicipality.stateCode]
                      : "";

                    if (!stateCode) {
                      console.error(
                        "Código de estado IBGE não reconhecido:",
                        selectedMunicipality.stateCode,
                      );

                      return;
                    }

                    setFilters((current) => ({
                      ...current,
                      state: stateCode,
                      municipality: selectedMunicipality.municipality,
                    }));

                    setAppliedFilters((current) => ({
                      ...current,
                      state: stateCode,
                      municipality: selectedMunicipality.municipality,
                    }));

                    scrollToDashboardTop();
                  }}
                />

                {appliedFilters.municipality && marketData[0] && (
                  <MarketRankingPosition
                    marketData={marketData[0]}
                    sortBy={appliedFilters.sortBy}
                    state={marketData[0].state ?? ""}
                  />
                )}
              </div>

              {marketAnalysis && (
                <>
                  <PopulationAgeChart
                    data={marketAnalysis}
                    selectedAgeGroup={selectedAgeGroup}
                    onSelectAgeGroup={(ageGroup) => {
                      setFilters((current) => ({
                        ...current,
                        ageGroup: ageGroup as AgeGroup,
                      }));

                      setAppliedFilters((current) => ({
                        ...current,
                        ageGroup: ageGroup as AgeGroup,
                      }));
                      scrollToDashboardTop();
                    }}
                  />

                  <AnsAgeDistributionChart
                    data={marketAnalysis}
                    selectedAgeGroup={selectedAgeGroup}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default MarketDashboard;
