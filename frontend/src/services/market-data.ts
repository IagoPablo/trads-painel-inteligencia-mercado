import axios from "axios";
import type {
  MarketAnalysis,
  MarketDataResponse,
  MarketDataSummary,
} from "../types/market-data";
import type { MarketFilters } from "../types/market-filters";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function getMarketData(
  filters: MarketFilters,
): Promise<MarketDataResponse> {
  const response = await api.get<MarketDataResponse>("/market-data", {
    params: {
      state: filters.state || undefined,
      municipality: filters.municipality || undefined,
      sortBy: filters.sortBy,
      order: filters.order,
    },
  });

  return response.data;
}

export async function getMarketDataSummary(
  filters: MarketFilters,
): Promise<MarketDataSummary> {
  const response = await api.get<MarketDataSummary>("/market-data/summary", {
    params: {
      state: filters.state || undefined,
      municipality: filters.municipality || undefined,
    },
  });

  return response.data;
}

export async function getMarketAnalysis(
  ibgeCode: string,
): Promise<MarketAnalysis> {
  const response = await api.get<MarketAnalysis>(
    `/market-analysis/municipalities/${ibgeCode}`,
  );

  return response.data;
}
