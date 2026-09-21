import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MarketAnalysis } from "../types/market-data";

import "./PopulationAgeChart.css";

interface AnsAgeDistributionChartProps {
  data: MarketAnalysis;
  selectedAgeGroup: string;
}

function AnsAgeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      ageGroup: string;
      beneficiaries: number;
    };
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="age-chart-tooltip">
      <span>Beneficiários</span>
      <strong>{item.ageGroup}</strong>
      {item.beneficiaries.toLocaleString("pt-BR")} beneficiários
    </div>
  );
}

function AnsAgeDistributionChart({
  data,
  selectedAgeGroup,
}: AnsAgeDistributionChartProps) {
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
    <section className="age-chart">
      <header className="age-chart-header">
        <div className="age-chart-heading">
          <span className="age-chart-eyebrow">Perfil do mercado</span>

          <h2>Beneficiários por faixa etária</h2>

          <p>
            Distribuição dos beneficiários de planos por faixa etária segundo a
            ANS.
          </p>
        </div>

        <div className="age-chart-reference">
          <span>Fonte</span>
          <strong>ANS {data.ans.referencePeriod}</strong>
        </div>
      </header>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 28,
            right: 30,
            left: 12,
            bottom: 50,
          }}
          barCategoryGap="18%"
        >
          <CartesianGrid
            vertical={false}
            stroke="#edf0f4"
            strokeDasharray="0"
          />

          <XAxis
            dataKey="ageGroup"
            angle={-30}
            textAnchor="end"
            height={80}
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#344054",
              fontSize: 12,
              fontWeight: 500,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#98a2b3",
              fontSize: 10,
            }}
            tickFormatter={(value) => Number(value).toLocaleString("pt-BR")}
          />

          <Tooltip
            content={<AnsAgeTooltip />}
            cursor={{
              fill: "rgba(37, 99, 235, 0.04)",
            }}
          />

          <Bar
            dataKey="beneficiaries"
            name="Beneficiários"
            maxBarSize={34}
            radius={[5, 5, 0, 0]}
            cursor="default"
            shape={(props) => {
              const isSelected = props.payload?.ageGroup === selectedAgeGroup;

              return (
                <Rectangle
                  {...props}
                  fill={isSelected ? "#344054" : "#2563eb"}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      <footer className="age-chart-footer">
        <div className="age-chart-legend">
          <span className="age-chart-legend-dot" />
          <span>Beneficiários de planos</span>
        </div>

        <span>Dados referentes a {data.ans.referencePeriod}</span>
      </footer>
    </section>
  );
}

export default AnsAgeDistributionChart;
