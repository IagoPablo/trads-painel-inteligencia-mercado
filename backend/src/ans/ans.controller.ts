import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

import { AnsService } from './ans.service';
import { SyncApiKeyGuard } from '../common/guards/sync-api-key.guard';

@Controller('ans')
export class AnsController {
  constructor(private readonly ansService: AnsService) {}

  @Post('sync')
  @UseGuards(SyncApiKeyGuard)
  @ApiSecurity('sync-api-key')
  @ApiOperation({
    summary: 'Sincronizar dados da ANS',
    description:
      'Baixa os dados oficiais de cobertura de planos de saúde da ANS, processa os registros e persiste os dados municipais no banco.',
  })
  @ApiOkResponse({
    description: 'Dados da ANS sincronizados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chave de sincronização ausente ou inválida.',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço externo da ANS indisponível.',
  })
  async sync() {
    return this.ansService.syncCoverageData();
  }

  @Get('municipalities/:ibgeCode')
  @ApiOperation({
    summary: 'Consultar dados da ANS por município',
    description:
      'Consulta os dados da ANS persistidos no banco para um município.',
  })
  @ApiParam({
    name: 'ibgeCode',
    description: 'Código IBGE do município.',
    example: '2507507',
  })
  @ApiOkResponse({
    description: 'Dados da ANS encontrados.',
  })
  async getMunicipalityData(@Param('ibgeCode') ibgeCode: string) {
    return this.ansService.getMunicipalityData(ibgeCode);
  }
}
