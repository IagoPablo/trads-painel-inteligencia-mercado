import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IbgeService {
  private readonly baseUrl =
    'https://servicodados.ibge.gov.br/api/v1/localidades';

  constructor(private readonly httpService: HttpService) {}

  async getStates() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/estados`),
    );

    return response.data;
  }
  
  async getMunicipalitiesByState(stateUf: string) {
  const response = await firstValueFrom(
    this.httpService.get(`${this.baseUrl}/estados/${stateUf}/municipios`),
  );

  return response.data;
}
}