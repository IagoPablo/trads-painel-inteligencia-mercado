import { Module } from '@nestjs/common';
import { IbgeModule } from '../ibge/ibge.module';
import { DatabaseModule } from '../database/database.module';
import { MarketDataController } from './market-data.controller';
import { MarketDataService } from './market-data.service';

@Module({
  imports: [IbgeModule, DatabaseModule],
  controllers: [MarketDataController],
  providers: [MarketDataService],
})
export class MarketDataModule {}