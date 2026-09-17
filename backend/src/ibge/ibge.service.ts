import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IbgeService {
  private readonly localidadesBaseUrl =
    'https://servicodados.ibge.gov.br/api/v1/localidades';

  private readonly agregadosBaseUrl =
    'https://servicodados.ibge.gov.br/api/v3/agregados';

  constructor(private readonly httpService: HttpService) {}

  async getStates() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.localidadesBaseUrl}/estados`),
    );

    return response.data;
  }

  async getMunicipalitiesByState(stateUf: string) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.localidadesBaseUrl}/estados/${stateUf}/municipios`,
      ),
    );

    return response.data;
  }

  async getPopulationByMunicipality(referencePeriod: number) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.agregadosBaseUrl}/4714/periodos/${referencePeriod}/variaveis/93?localidades=N6[all]`,
      ),
    );

    return response.data;
  }
  async getHouseholdIncomeByMunicipality(referencePeriod: number) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.agregadosBaseUrl}/10295/periodos/${referencePeriod}/variaveis/13431?localidades=N6[all]&classificacao=2[6794]|86[95251]|58[95253]`,
      ),
    );

    return response.data;
  }
}