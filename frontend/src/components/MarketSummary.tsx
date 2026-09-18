import type { MarketDataSummary } from '../types/market-data';
import type { AgeGroup } from '../types/market-filters';

interface MarketSummaryProps {
  summary: MarketDataSummary;
  ageGroup: AgeGroup | '';
  state: string;
  municipality: string;
}

function MarketSummary({
  summary,
  ageGroup,
  state,
  municipality,
}: MarketSummaryProps) {
  const ageGroupPopulation = ageGroup
    ? summary.ageGroups[ageGroup]
    : 0;

  const isMunicipalitySelected = Boolean(municipality);

  const locationName = municipality
    ? municipality
    : state
      ? state
      : 'Brasil';

  return (
    <section className="market-summary">
      <article className="market-summary-card">
        <span>
          {isMunicipalitySelected
            ? 'Mercado'
            : 'Municípios'}
        </span>

        <strong>
          {isMunicipalitySelected
            ? locationName
            : summary.municipalities.toLocaleString('pt-BR')}
        </strong>
      </article>

      <article className="market-summary-card">
        <span>População</span>

        <strong>
          {summary.population.toLocaleString('pt-BR')}
        </strong>
      </article>

      <article className="market-summary-card">
        <span>Renda média</span>

        <strong>
          {summary.averageHouseholdIncome.toLocaleString(
            'pt-BR',
            {
              style: 'currency',
              currency: 'BRL',
            },
          )}
        </strong>
      </article>

      <article className="market-summary-card">
        <span>
          {ageGroup
            ? `Público ${ageGroup} anos`
            : 'Público'}
        </span>

        <strong>
          {ageGroup
            ? ageGroupPopulation.toLocaleString('pt-BR')
            : 'Todos os públicos'}
        </strong>
      </article>
    </section>
  );
}

export default MarketSummary;