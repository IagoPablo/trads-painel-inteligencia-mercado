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
import type { AgeGroup } from '../types/market-filters';

interface AgeDistributionChartProps {
  data: MarketData[];
  selectedAgeGroup: AgeGroup | '';
}

function AgeDistributionChart({
  data,
  selectedAgeGroup,
}: AgeDistributionChartProps) {
  const ageGroups: AgeGroup[] = [
    '0-14',
    '15-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65+',
  ];

  const chartData = ageGroups.map((ageGroup) => ({
    ageGroup,
    population: data.reduce(
      (total, item) =>
        total + (item.ageGroups[ageGroup] ?? 0),
      0,
    ),
  }));

  return (
    <section>
      <h2>Distribuição por Público</h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="ageGroup" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="population"
            shape={(props) => {
              const isSelected =
                props.payload?.ageGroup ===
                selectedAgeGroup;

              return (
                <Rectangle
                  {...props}
                  fill={
                    isSelected
                      ? '#1d4ed8'
                      : '#93c5fd'
                  }
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default AgeDistributionChart;