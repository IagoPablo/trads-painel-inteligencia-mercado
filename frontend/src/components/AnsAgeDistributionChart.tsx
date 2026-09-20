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

interface AnsAgeDistributionChartProps {
  data: MarketAnalysis;
}

function AnsAgeDistributionChart({ data }: AnsAgeDistributionChartProps) {
  const ageGroups = [
    "Até 1 ano",
    "1 a 4 anos",
    "5 a 9 anos",
    "10 a 14 anos",
    "15 a 19 anos",
    "20 a 29 anos",
    "30 a 39 anos",
    "40 a 49 anos",
    "50 a 59 anos",
    "60 a 69 anos",
    "70 a 79 anos",
    "80 anos ou mais",
  ];

  const chartData = ageGroups.map((ageGroup) => ({
    ageGroup,
    beneficiaries: data.ans.ageGroups[ageGroup]?.total ?? 0,
  }));

  return (
    <section>
      <h2>Beneficiários por faixa etária</h2>

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

          <XAxis dataKey="ageGroup" angle={-30} textAnchor="end" height={80} />

          <YAxis />

          <Tooltip
            formatter={(value) => Number(value).toLocaleString("pt-BR")}
          />

          <Bar dataKey="beneficiaries" fill="#60a5fa" name="Beneficiários" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export default AnsAgeDistributionChart;
