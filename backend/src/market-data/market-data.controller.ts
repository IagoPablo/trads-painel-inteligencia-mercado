import { Controller, Get, Post, Query } from '@nestjs/common';
import { MarketDataService } from './market-data.service';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Post('sync/population')
  syncPopulation() {
    return this.marketDataService.syncPopulation(2022);
  }
  
  @Get('count')
  countIndicators() {
    return this.marketDataService.countIndicators();
 }

}