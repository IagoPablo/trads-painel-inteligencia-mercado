import type { MarketData } from '../types/market-data';
import type { AgeGroup } from '../types/market-filters';

interface MarketSummaryProps {
  data: MarketData[];
  ageGroup: AgeGroup | '';
}

function MarketSummary({ data, ageGroup }: MarketSummaryProps) {
  const population = data.reduce(
    (total, item) => total + (item.population ?? 0),
    0,
  );

  const incomeValues = data
    .map((item) => item.householdIncome)
    .filter((value): value is number => value !== null);

  const averageIncome =
    incomeValues.length > 0
      ? incomeValues.reduce((total, value) => total + value, 0) /
        incomeValues.length
      : 0;

  const ageGroupPopulation = ageGroup
    ? data.reduce(
        (total, item) => total + (item.ageGroups[ageGroup] ?? 0),
        0,
      )
    : null;

  return (
    <section>
      <article>
        <span>População</span>
        <strong>{population.toLocaleString('pt-BR')}</strong>
      </article>

      <article>
        <span>Renda média</span>
        <strong>
          {averageIncome.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </strong>
      </article>

      <article>
        <span>
          {ageGroup ? `Público ${ageGroup} anos` : 'Faixa etária'}
        </span>

        <strong>
          {ageGroup
            ? ageGroupPopulation?.toLocaleString('pt-BR')
            : 'Selecione uma faixa'}
        </strong>
      </article>
    </section>
  );
}

export default MarketSummary;