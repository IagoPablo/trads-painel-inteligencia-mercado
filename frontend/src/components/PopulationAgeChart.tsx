import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MarketAnalysis } from "../types/market-data";
import type { AgeGroup } from "../types/market-filters";

interface PopulationAgeChartProps {
  data: MarketAnalysis;
  selectedAgeGroup: AgeGroup | "";
}

function PopulationAgeChart({
  data,
  selectedAgeGroup,
}: PopulationAgeChartProps) {
  const ageGroups: AgeGroup[] = [
    "0-14",
    "15-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
  ];

  const chartData = ageGroups.map((ageGroup) => ({
    ageGroup,
    population: data.ibge.ageGroups[ageGroup] ?? 0,
  }));

  return (
    <section>
      <h2>Distribuição da população por faixa etária</h2>

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

          <Tooltip
            formatter={(value) =>
              Number(value).toLocaleString("pt-BR")
            }
          />

          <Bar
            dataKey="population"
            fill="#93c5fd"
            name="População"
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default PopulationAgeChart;