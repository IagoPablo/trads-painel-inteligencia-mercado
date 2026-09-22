import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { MarketDataService } from './market-data.service';
import { FindMarketDataDto } from './dto/find-market-data.dto';
import { MarketDataFiltersDto } from './dto/market-data-filters.dto';
import { SyncApiKeyGuard } from '../common/guards/sync-api-key.guard';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Post('sync/population')
  @UseGuards(SyncApiKeyGuard)
  syncPopulation() {
    return this.marketDataService.syncPopulation(2022);
  }

  @Post('sync/household-income')
  @UseGuards(SyncApiKeyGuard)
  syncHouseholdIncome() {
    return this.marketDataService.syncHouseholdIncome(2022);
  }

  @Post('sync/age-groups')
  @UseGuards(SyncApiKeyGuard)
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
