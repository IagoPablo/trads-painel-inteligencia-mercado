import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MarketData } from '../types/market-data';
import type { SortBy } from '../types/market-filters';

interface MarketRankingProps {
  data: MarketData[];
  sortBy: SortBy;
  selectedMunicipality: string;
  onSelectMunicipality: (municipality: string) => void;
}

function MarketRanking({
  data,
  sortBy,
  selectedMunicipality,
  onSelectMunicipality,
}: MarketRankingProps) {
  const chartData = data
    .filter((item) =>
      sortBy === 'population'
        ? item.population !== null
        : item.householdIncome !== null,
    )
    .slice(0, 10)
    .map((item, index) => ({
      municipality: item.municipality,
      label: `${index + 1}º ${item.municipality}`,
      value:
        sortBy === 'population'
          ? item.population ?? 0
          : item.householdIncome ?? 0,
    }));

  const title =
    sortBy === 'population'
      ? 'Ranking por população'
      : 'Ranking por renda média';

  function handleBarClick(
    _entry: unknown,
    index: number,
  ) {
    const municipality = chartData[index]?.municipality;

    if (!municipality) {
      return;
    }

    onSelectMunicipality(municipality);
  }

  return (
    <section className="market-ranking">
      <h2>{title}</h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 10,
            right: 30,
            left: 30,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" />

          <YAxis
            dataKey="label"
            type="category"
            width={120}
          />

          <Tooltip />

          <Bar
            dataKey="value"
            onClick={handleBarClick}
            cursor="pointer"
            shape={(props) => {
              const isSelected =
                props.payload?.municipality === selectedMunicipality;

              return (
                <Rectangle
                  {...props}
                  fill={isSelected ? '#111827' : '#2563eb'}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default MarketRanking;