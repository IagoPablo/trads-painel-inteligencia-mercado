import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

import { LocationsService } from './locations.service';
import { SyncApiKeyGuard } from '../common/guards/sync-api-key.guard';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('count')
  @ApiOperation({
    summary: 'Contar localidades',
    description:
      'Retorna a quantidade de localidades persistidas no banco de dados.',
  })
  @ApiOkResponse({
    description: 'Quantidade de localidades retornada com sucesso.',
  })
  countLocations() {
    return this.locationsService.countLocations();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar município',
    description:
      'Busca municípios persistidos no banco pelo nome ou por parte do nome.',
  })
  @ApiQuery({
    name: 'name',
    description: 'Nome ou parte do nome do município.',
    example: 'João Pessoa',
  })
  @ApiOkResponse({
    description: 'Resultado da busca retornado com sucesso.',
  })
  searchMunicipality(@Query('name') name: string) {
    return this.locationsService.findMunicipality(name);
  }

  @Post('sync')
  @UseGuards(SyncApiKeyGuard)
  @ApiSecurity('sync-api-key')
  @ApiOperation({
    summary: 'Sincronizar localidades',
    description:
      'Atualiza as localidades armazenadas no banco utilizando os dados do IBGE.',
  })
  @ApiOkResponse({
    description: 'Localidades sincronizadas com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chave de sincronização ausente ou inválida.',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço externo do IBGE indisponível.',
  })
  syncLocations() {
    return this.locationsService.syncLocations();
  }

  @Get('municipalities')
  @ApiOperation({
    summary: 'Listar municípios',
    description:
      'Consulta os municípios persistidos no banco, opcionalmente filtrados por estado.',
  })
  @ApiOkResponse({
    description: 'Lista de municípios retornada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Sigla de estado inválida.',
  })
  getMunicipalities(@Query('state') state?: string) {
    return this.locationsService.getMunicipalities(state);
  }
}
