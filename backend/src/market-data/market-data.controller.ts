import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { MarketDataService } from './market-data.service';
import { FindMarketDataDto } from './dto/find-market-data.dto';
import { MarketDataFiltersDto } from './dto/market-data-filters.dto';
import { SyncApiKeyGuard } from '../common/guards/sync-api-key.guard';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Post('sync/population')
  @UseGuards(SyncApiKeyGuard)
  @ApiSecurity('sync-api-key')
  @ApiOperation({
    summary: 'Sincronizar população',
    description:
      'Atualiza os dados populacionais dos municípios utilizando dados do IBGE e persiste os resultados no banco.',
  })
  @ApiOkResponse({
    description: 'Dados populacionais sincronizados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chave de sincronização ausente ou inválida.',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço externo do IBGE indisponível.',
  })
  syncPopulation() {
    return this.marketDataService.syncPopulation(2022);
  }

  @Post('sync/household-income')
  @UseGuards(SyncApiKeyGuard)
  @ApiSecurity('sync-api-key')
  @ApiOperation({
    summary: 'Sincronizar renda domiciliar',
    description:
      'Atualiza os dados de rendimento domiciliar mensal per capita dos municípios utilizando dados do IBGE e persiste os resultados no banco.',
  })
  @ApiOkResponse({
    description: 'Dados de renda domiciliar sincronizados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chave de sincronização ausente ou inválida.',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço externo do IBGE indisponível.',
  })
  syncHouseholdIncome() {
    return this.marketDataService.syncHouseholdIncome(2022);
  }

  @Post('sync/age-groups')
  @UseGuards(SyncApiKeyGuard)
  @ApiSecurity('sync-api-key')
  @ApiOperation({
    summary: 'Sincronizar faixas etárias',
    description:
      'Atualiza os dados populacionais por faixa etária dos municípios utilizando dados do IBGE e persiste os resultados no banco.',
  })
  @ApiOkResponse({
    description: 'Dados de faixas etárias sincronizados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chave de sincronização ausente ou inválida.',
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço externo do IBGE indisponível.',
  })
  syncAgeGroups() {
    return this.marketDataService.syncAgeGroups(2022);
  }

  @Get('count')
  @ApiOperation({
    summary: 'Contar indicadores',
    description:
      'Retorna a quantidade de indicadores de mercado persistidos no banco de dados.',
  })
  @ApiOkResponse({
    description: 'Quantidade de indicadores retornada com sucesso.',
  })
  countIndicators() {
    return this.marketDataService.countIndicators();
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Obter resumo dos dados de mercado',
    description:
      'Retorna um resumo estatístico dos dados de mercado persistidos no banco, respeitando os filtros informados.',
  })
  @ApiOkResponse({
    description: 'Resumo dos dados de mercado retornado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de consulta inválidos.',
  })
  getMarketDataSummary(@Query() filters: MarketDataFiltersDto) {
    return this.marketDataService.getMarketDataSummary(filters);
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar dados de mercado',
    description:
      'Consulta os indicadores de mercado persistidos no banco de dados, com filtros, ordenação e paginação.',
  })
  @ApiOkResponse({
    description: 'Dados de mercado encontrados com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de consulta inválidos.',
  })
  findMarketData(@Query() filters: FindMarketDataDto) {
    return this.marketDataService.findMarketData(filters);
  }
}
