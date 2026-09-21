import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { LocationsService } from '../locations/locations.service';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable()
export class DataSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DataSyncService.name);

  private readonly marketDataReferencePeriod = 2022;

  constructor(
    private readonly locationsService: LocationsService,
    private readonly marketDataService: MarketDataService,
  ) {}

  async onApplicationBootstrap() {
    await this.syncInitialData();
  }

  async syncInitialData() {
    const locationsCount = await this.locationsService.countLocations();

    const hasRequiredIndicators =
      await this.marketDataService.hasRequiredIndicators(
        this.marketDataReferencePeriod,
      );

    if (locationsCount > 0 && hasRequiredIndicators) {
      this.logger.log(
        'Dados de mercado já estão disponíveis. Sincronização inicial ignorada.',
      );

      return;
    }

    this.logger.log(
      'Dados de mercado incompletos ou não encontrados. Iniciando sincronização inicial...',
    );

    if (locationsCount === 0) {
      this.logger.log('Sincronizando localidades...');
      await this.locationsService.syncLocations();
      this.logger.log('Localidades sincronizadas.');
    }

    this.logger.log('Sincronizando população...');
    await this.marketDataService.syncPopulation(this.marketDataReferencePeriod);
    this.logger.log('População sincronizada.');

    this.logger.log('Sincronizando renda domiciliar...');
    await this.marketDataService.syncHouseholdIncome(
      this.marketDataReferencePeriod,
    );
    this.logger.log('Renda domiciliar sincronizada.');

    this.logger.log('Sincronizando faixas etárias...');
    await this.marketDataService.syncAgeGroups(this.marketDataReferencePeriod);
    this.logger.log('Faixas etárias sincronizadas.');

    this.logger.log('Sincronização inicial dos dados concluída.');
  }
}
