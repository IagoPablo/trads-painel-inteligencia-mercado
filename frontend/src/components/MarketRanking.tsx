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

import type { MarketData } from "../types/market-data";
import type { SortBy } from "../types/market-filters";

import "./MarketRanking.css";

interface MarketRankingProps {
  data: MarketData[];
  sortBy: SortBy;
  selectedMunicipality: string;
  onSelectMunicipality: (municipality: MarketData) => void;
}

function RankingTooltip({
  active,
  payload,
  sortBy,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      municipality: string;
      value: number;
    };
  }>;
  sortBy: SortBy;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  const label = sortBy === "population" ? "População" : "Renda média";

  const numericValue = Number(item.value);

  const value =
    sortBy === "population"
      ? `${numericValue.toLocaleString("pt-BR")} pessoas`
      : numericValue.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

  return (
    <div className="market-ranking-tooltip">
      <span>{label}</span>
      <strong>{item.municipality}</strong>
      <span className="market-ranking-tooltip-value">{value}</span>
    </div>
  );
}

function MarketRanking({
  data,
  sortBy,
  selectedMunicipality,
  onSelectMunicipality,
}: MarketRankingProps) {
  const chartData = data
    .filter((item) =>
      sortBy === "population"
        ? item.population !== null
        : item.householdIncome !== null,
    )
    .slice(0, 10)
    .map((item, index) => ({
      municipality: item.municipality,
      label: `${index + 1}º ${item.municipality}`,
      value:
        sortBy === "population"
          ? (item.population ?? 0)
          : (item.householdIncome ?? 0),
    }));

  const title =
    sortBy === "population"
      ? "Ranking por população"
      : "Ranking por renda média";

  const description =
    sortBy === "population"
      ? "Municípios com maior população na seleção atual."
      : "Municípios com maior renda domiciliar per capita média.";

  function handleBarClick(_entry: unknown, index: number) {
    const municipality = data
      .filter((item) =>
        sortBy === "population"
          ? item.population !== null
          : item.householdIncome !== null,
      )
      .slice(0, 10)[index];

    if (!municipality) {
      return;
    }

    onSelectMunicipality(municipality);
  }

  return (
    <section className="market-ranking">
      <header className="market-ranking-header">
        <div className="market-ranking-heading">
          <span className="market-ranking-eyebrow">Inteligência regional</span>

          <div className="market-ranking-title-row">
            <h2>{title}</h2>

            <span className="market-ranking-count">Top {chartData.length}</span>
          </div>

          <p>{description}</p>
        </div>

        <div className="market-ranking-metric">
          <span>Critério</span>

          <strong>{sortBy === "population" ? "População" : "Renda"}</strong>
        </div>
      </header>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 12,
            right: 48,
            left: 12,
            bottom: 12,
          }}
          barCategoryGap="24%"
        >
          <CartesianGrid
            horizontal={false}
            stroke="#edf0f4"
            strokeDasharray="0"
          />

          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#98a2b3",
              fontSize: 10,
            }}
          />

          <YAxis
            dataKey="label"
            type="category"
            width={125}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "rgb(52, 64, 84)",
              fontSize: 12,
              fontWeight: 500,
            }}
          />

          <Tooltip content={<RankingTooltip sortBy={sortBy} />} />

          <Bar
            dataKey="value"
            onClick={handleBarClick}
            cursor="pointer"
            maxBarSize={26}
            radius={[0, 5, 5, 0]}
            shape={(props) => {
              const isSelected =
                props.payload?.municipality === selectedMunicipality;

              return (
                <Rectangle
                  {...props}
                  fill={isSelected ? "#1e3a8a" : "#2563eb"}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      <footer className="market-ranking-footer">
        <div className="market-ranking-legend">
          <span className="legend-dot legend-dot-primary" />
          <span>Municípios do ranking</span>
        </div>

        <div className="market-ranking-legend">
          <span className="legend-dot legend-dot-selected" />
          <span>Município selecionado</span>
        </div>

        <span className="market-ranking-hint">
          Clique em um município para analisar o mercado.
        </span>
      </footer>
    </section>
  );
}

export default MarketRanking;
