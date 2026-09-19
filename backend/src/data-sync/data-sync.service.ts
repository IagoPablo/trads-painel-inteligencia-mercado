import {
  Injectable,
  Logger,OnApplicationBootstrap,} from '@nestjs/common';

import { LocationsService } from '../locations/locations.service';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable()
export class DataSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DataSyncService.name);

  constructor(
    private readonly locationsService: LocationsService,
    private readonly marketDataService: MarketDataService,
  ) {}

  async onApplicationBootstrap() {
    await this.syncInitialData();
  }

  async syncInitialData() {
    const locationsCount =
        await this.locationsService.countLocations();

    const indicatorsCount =
        await this.marketDataService.countIndicators();

    if (locationsCount > 0 && indicatorsCount > 0) {
        this.logger.log(
        'Dados de mercado já estão disponíveis. Sincronização inicial ignorada.',
        );

        return;
    }

    this.logger.log(
        'Dados de mercado não encontrados. Iniciando sincronização inicial...',
    );

    this.logger.log('Sincronizando localidades...');
    await this.locationsService.syncLocations();
    this.logger.log('Localidades sincronizadas.');

    this.logger.log('Sincronizando população...');
    await this.marketDataService.syncPopulation(2022);
    this.logger.log('População sincronizada.');

    this.logger.log('Sincronizando renda domiciliar...');
    await this.marketDataService.syncHouseholdIncome(2022);
    this.logger.log('Renda domiciliar sincronizada.');

    this.logger.log('Sincronizando faixas etárias...');
    await this.marketDataService.syncAgeGroups(2022);
    this.logger.log('Faixas etárias sincronizadas.');

    this.logger.log(
        'Sincronização inicial dos dados concluída.',
    );
  }
}