import { Module } from '@nestjs/common';
import { LocationsModule } from '../locations/locations.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { DataSyncService } from './data-sync.service';

@Module({
  imports: [LocationsModule, MarketDataModule],
  providers: [DataSyncService],
})
export class DataSyncModule {}