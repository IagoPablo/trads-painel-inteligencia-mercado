import { Module } from '@nestjs/common';

import { AnsModule } from '../ans/ans.module';
import { LocationsModule } from '../locations/locations.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { DataSyncService } from './data-sync.service';

@Module({
  imports: [AnsModule, LocationsModule, MarketDataModule],
  providers: [DataSyncService],
})
export class DataSyncModule {}