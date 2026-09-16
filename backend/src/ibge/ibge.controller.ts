import { Controller, Get, Param } from '@nestjs/common';
import { IbgeService } from './ibge.service';

@Controller('ibge')
export class IbgeController {
  constructor(private readonly ibgeService: IbgeService) {}

  @Get('estados')
  getStates() {
    return this.ibgeService.getStates();
  }

  @Get('estados/:uf/municipios')
  getMunicipalities(@Param('uf') uf: string) {
    return this.ibgeService.getMunicipalitiesByState(uf);
  }
}