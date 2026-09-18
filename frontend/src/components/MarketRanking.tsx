import {
  Bar,
  BarChart,
  CartesianGrid,
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
}

function MarketRanking({ data, sortBy }: MarketRankingProps) {
  const chartData = data
    .filter((item) =>
      sortBy === 'population'
        ? item.population !== null
        : item.householdIncome !== null,
    )
    .map((item) => ({
      municipality: item.municipality,
      value:
        sortBy === 'population'
          ? item.population ?? 0
          : item.householdIncome ?? 0,
    }));

  const title =
    sortBy === 'population'
      ? 'Ranking por população'
      : 'Ranking por renda média';

  return (
    <section>
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

          <XAxis
            type="number"
          />

          <YAxis
            dataKey="municipality"
            type="category"
            width={120}
          />

          <Tooltip />

          <Bar
            dataKey="value"
            fill="#2563eb"
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default MarketRanking;