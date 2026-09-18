import axios from 'axios';

import type { Municipality } from '../types/location';

const api = axios.create({
  baseURL: 'http://localhost:3000',
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