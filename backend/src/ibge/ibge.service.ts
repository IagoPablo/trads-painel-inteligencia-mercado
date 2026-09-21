import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IbgeService {
  private readonly logger = new Logger(IbgeService.name);

  private readonly localidadesBaseUrl =
    'https://servicodados.ibge.gov.br/api/v1/localidades';

  private readonly agregadosBaseUrl =
    'https://servicodados.ibge.gov.br/api/v3/agregados';

  constructor(private readonly httpService: HttpService) {}

  async getStates() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.localidadesBaseUrl}/estados`, {
          timeout: 10000,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Erro ao consultar estados no IBGE.',
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException(
        'Não foi possível consultar os estados no IBGE.',
      );
    }
  }

  async getMunicipalitiesByState(stateUf: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.localidadesBaseUrl}/estados/${stateUf}/municipios`,
          {
            timeout: 10000,
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Erro ao consultar municípios do estado ${stateUf} no IBGE.`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException(
        'Não foi possível consultar os municípios no IBGE.',
      );
    }
  }

  async getPopulationByMunicipality(referencePeriod: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.agregadosBaseUrl}/4714/periodos/${referencePeriod}/variaveis/93?localidades=N6[all]`,
          {
            timeout: 30000,
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Erro ao consultar população no IBGE para ${referencePeriod}.`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException(
        'Não foi possível consultar os dados de população no IBGE.',
      );
    }
  }

  async getHouseholdIncomeByMunicipality(referencePeriod: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.agregadosBaseUrl}/10295/periodos/${referencePeriod}/variaveis/13431?localidades=N6[all]&classificacao=2[6794]|86[95251]|58[95253]`,
          {
            timeout: 30000,
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Erro ao consultar renda domiciliar no IBGE para ${referencePeriod}.`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException(
        'Não foi possível consultar os dados de renda domiciliar no IBGE.',
      );
    }
  }

  async getAgeGroupsByMunicipalities(
    municipalityCodes: string[],
    referencePeriod: number,
  ) {
    const ageGroupCodes = [
      '93070', // 0 a 4
      '93084', // 5 a 9
      '93085', // 10 a 14
      '93086', // 15 a 19
      '93087', // 20 a 24
      '93088', // 25 a 29
      '93089', // 30 a 34
      '93090', // 35 a 39
      '93091', // 40 a 44
      '93092', // 45 a 49
      '93093', // 50 a 54
      '93094', // 55 a 59
      '93095', // 60 a 64
      '93096', // 65 a 69
      '93097', // 70 a 74
      '93098', // 75 a 79
      '49108', // 80 a 84
      '49109', // 85 a 89
      '60040', // 90 a 94
      '60041', // 95 a 99
      '6653', // 100+
    ].join(',');

    const municipalityQuery = municipalityCodes.join(',');

    const url =
      `${this.agregadosBaseUrl}/9514/periodos/${referencePeriod}/variaveis/93` +
      `?localidades=N6[${municipalityQuery}]` +
      `&classificacao=2[6794]|287[${ageGroupCodes}]|286[113635]`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(url, {
            timeout: 10000,
          }),
        );

        return response.data;
      } catch (error) {
        this.logger.error(
          `Erro ao consultar grupos etários no IBGE. Tentativa ${attempt}/3.`,
          error instanceof Error ? error.stack : String(error),
        );

        if (attempt < 3) {
          await new Promise((resolve) =>
            setTimeout(resolve, attempt * 1000),
          );
        }
      }
    }

    throw new ServiceUnavailableException(
      'Não foi possível consultar os dados de faixa etária do IBGE após 3 tentativas.',
    );
  }
}