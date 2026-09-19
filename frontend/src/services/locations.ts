import axios from 'axios';

import type { Municipality } from '../types/location';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function getMunicipalities(
  state: string,
): Promise<Municipality[]> {
  const response = await api.get<Municipality[]>(
    '/locations/municipalities',
    {
      params: {
        state,
      },
    },
  );

  return response.data;
}