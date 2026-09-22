import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { LocationsService } from './locations.service';
import { SyncApiKeyGuard } from '../common/guards/sync-api-key.guard';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('count')
  countLocations() {
    return this.locationsService.countLocations();
  }

  @Get('search')
  searchMunicipality(@Query('name') name: string) {
    return this.locationsService.findMunicipality(name);
  }

  @Post('sync')
  @UseGuards(SyncApiKeyGuard)
  syncLocations() {
    return this.locationsService.syncLocations();
  }

  @Get('municipalities')
  getMunicipalities(@Query('state') state?: string) {
    return this.locationsService.getMunicipalities(state);
  }
}
