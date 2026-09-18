import axios from 'axios';

import type { MarketDataResponse } from '../types/market-data';
import type { MarketFilters } from '../types/market-filters';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export async function getMarketData(
  filters: MarketFilters,
): Promise<MarketDataResponse> {
  const response = await api.get<MarketDataResponse>('/market-data', {
    params: {
      state: filters.state || undefined,
      municipality: filters.municipality || undefined,
      sortBy: filters.sortBy,
      order: filters.order,
    },
  });

  return response.data;
}