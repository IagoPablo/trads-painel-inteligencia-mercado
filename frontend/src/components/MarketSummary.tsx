import type { MarketDataSummary } from '../types/market-data';
import type { AgeGroup } from '../types/market-filters';

interface MarketSummaryProps {
  summary: MarketDataSummary;
  ageGroup: AgeGroup | '';
}

function MarketSummary({
  summary,
  ageGroup,
}: MarketSummaryProps) {
  const ageGroupPopulation = ageGroup
    ? summary.ageGroups[ageGroup]
    : 0;

  return (
    <section>
      <article>
        <span>Municípios</span>
        <strong>
          {summary.municipalities.toLocaleString('pt-BR')}
        </strong>
      </article>

      <article>
        <span>População</span>
        <strong>
          {summary.population.toLocaleString('pt-BR')}
        </strong>
      </article>

      <article>
        <span>Renda média</span>
        <strong>
          {summary.averageHouseholdIncome.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </strong>
      </article>

      <article>
        <span>
          {ageGroup
            ? `Público ${ageGroup} anos`
            : 'Público'}
        </span>

        <strong>
          {ageGroup
            ? ageGroupPopulation.toLocaleString('pt-BR')
            : 'Selecione um público'}
        </strong>
      </article>
    </section>
  );
}

export default MarketSummary;