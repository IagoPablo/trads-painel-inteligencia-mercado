import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { IbgeService } from './ibge.service';

@Controller('ibge')
export class IbgeController {
  constructor(private readonly ibgeService: IbgeService) {}

  @Get('estados')
  @ApiOperation({
    summary: 'Consultar estados no IBGE',
    description:
      'Obtém a lista de estados diretamente do serviço de localidades do IBGE.',
  })
  @ApiOkResponse({
    description: 'Lista de estados retornada com sucesso.',
  })
  getStates() {
    return this.ibgeService.getStates();
  }

  @Get('estados/:uf/municipios')
  @ApiOperation({
    summary: 'Consultar municípios de um estado no IBGE',
    description:
      'Obtém os municípios de uma unidade federativa diretamente do serviço de localidades do IBGE.',
  })
  @ApiParam({
    name: 'uf',
    description: 'Sigla da unidade federativa.',
    example: 'PB',
  })
  @ApiOkResponse({
    description: 'Lista de municípios retornada com sucesso.',
  })
  getMunicipalities(@Param('uf') uf: string) {
    return this.ibgeService.getMunicipalitiesByState(uf);
  }
}
