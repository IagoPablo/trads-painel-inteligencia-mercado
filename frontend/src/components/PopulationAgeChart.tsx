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

interface PopulationAgeChartProps {
  data: MarketAnalysis;
  selectedAgeGroup: string;
  onSelectAgeGroup: (ageGroup: string) => void;
}
function PopulationTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      ageGroup: string;
      population: number;
    };
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="age-chart-tooltip">
      <span>População</span>
      <strong>{item.ageGroup} anos</strong>
      {item.population.toLocaleString("pt-BR")} pessoas
    </div>
  );
}

function PopulationAgeChart({
  data,
  selectedAgeGroup,
  onSelectAgeGroup,
}: PopulationAgeChartProps) {
  const ageGroups = [
    "0-14",
    "15-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
  ] as const;

  const chartData = ageGroups.map((ageGroup) => ({
    ageGroup,
    population: data.ibge.ageGroups[ageGroup] ?? 0,
  }));

  return (
    <section className="age-chart">
      <header className="age-chart-header">
        <div className="age-chart-heading">
          <span className="age-chart-eyebrow">Perfil demográfico</span>

          <h2>Distribuição da população por faixa etária</h2>

          <p>População residente por faixa etária segundo o IBGE.</p>
        </div>

        <div className="age-chart-reference">
          <span>Fonte</span>
          <strong>IBGE {data.ibge.referencePeriod}</strong>
        </div>
      </header>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 12,
            bottom: 10,
          }}
          barCategoryGap="24%"
        >
          <CartesianGrid
            vertical={false}
            stroke="#edf0f4"
            strokeDasharray="0"
          />

          <XAxis
            dataKey="ageGroup"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#344054",
              fontSize: 11,
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
            content={<PopulationTooltip />}
            cursor={{
              fill: "rgba(37, 99, 235, 0.04)",
            }}
          />

          <Bar
            dataKey="population"
            name="População"
            maxBarSize={42}
            radius={[5, 5, 0, 0]}
            cursor="pointer"
            onClick={(entry) => {
              const ageGroup = entry?.payload?.ageGroup;

              if (ageGroup) {
                onSelectAgeGroup(ageGroup);
              }
            }}
            shape={(props) => {
              const isSelected = props.payload?.ageGroup === selectedAgeGroup;

              return (
                <Rectangle
                  {...props}
                  fill={isSelected ? "#1E3A8A" : "#2563eb"}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      <footer className="age-chart-footer">
        <div className="age-chart-legend">
          <span className="age-chart-legend-dot" />
          <span>População residente</span>
        </div>

        {selectedAgeGroup && (
          <div className="age-chart-legend">
            <span className="age-chart-legend-dot age-chart-legend-dot-selected" />
            <span>Faixa selecionada: {selectedAgeGroup} anos</span>
          </div>
        )}

        <span>Dados referentes a {data.ibge.referencePeriod}</span>
      </footer>
    </section>
  );
}

export default PopulationAgeChart;
