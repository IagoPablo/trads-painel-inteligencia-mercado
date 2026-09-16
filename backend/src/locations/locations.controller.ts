import { Controller, Get, Post, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

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
  syncLocations() {
    return this.locationsService.syncLocations();
  }
  
}