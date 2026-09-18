import { Controller, Get, Post, Query } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { FindMarketDataDto } from './dto/find-market-data.dto';
import { MarketDataFiltersDto } from './dto/market-data-filters.dto';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Post('sync/population')
  syncPopulation() {
    return this.marketDataService.syncPopulation(2022);
  }

  @Post('sync/household-income')
  syncHouseholdIncome() {
  return this.marketDataService.syncHouseholdIncome(2022);
 }
 
 @Post('sync/age-groups')
  syncAgeGroups() {
  return this.marketDataService.syncAgeGroups(2022);
 }

  @Get('count')
  countIndicators() {
    return this.marketDataService.countIndicators();
  }

  @Get('summary')
  getMarketDataSummary(@Query() filters: MarketDataFiltersDto) {
    return this.marketDataService.getMarketDataSummary(filters);
  }

  @Get()
  findMarketData(@Query() filters: FindMarketDataDto) {
    return this.marketDataService.findMarketData(filters);
 }
}