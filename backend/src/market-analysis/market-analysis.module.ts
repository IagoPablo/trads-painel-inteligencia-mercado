import { Module } from '@nestjs/common';

import { AnsModule } from '../ans/ans.module';
import { MarketDataModule } from '../market-data/market-data.module';

import { MarketAnalysisController } from './market-analysis.controller';
import { MarketAnalysisService } from './market-analysis.service';

@Module({
  imports: [
    AnsModule, 
    MarketDataModule
  ],
  controllers: [MarketAnalysisController],
  providers: [MarketAnalysisService],
})
export class MarketAnalysisModule {}
