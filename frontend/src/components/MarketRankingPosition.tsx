import type { MarketData } from "../types/market-data";
import type { SortBy } from "../types/market-filters";
import "./MarketRankingPosition.css";

interface MarketRankingPositionProps {
  marketData: MarketData | null;
  sortBy: SortBy;
  state: string;
}

function MarketRankingPosition({
  marketData,
  sortBy,
  state,
}: MarketRankingPositionProps) {
  if (
    !marketData ||
    marketData.rankingPosition === null ||
    marketData.rankingPosition <= 10
  ) {
    return null;
  }

  const rankingLabel =
    sortBy === "population" ? "população" : "renda domiciliar per capita";

  const position = marketData.rankingPosition;

  return (
    <section className="market-ranking-position">
      <div>
        <span className="market-ranking-position-label">
          Posição no ranking estadual
        </span>

        <strong>{position}º lugar</strong>
      </div>

      <div>
        <span>{marketData.municipality}</span>

        <p>
          {state ? `${state} · ` : ""}
          Critério: {rankingLabel}
        </p>
      </div>
    </section>
  );
}

export default MarketRankingPosition;
