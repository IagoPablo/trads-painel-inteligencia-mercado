import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { MarketAnalysisService } from './market-analysis.service';

@Controller('market-analysis')
export class MarketAnalysisController {
  constructor(private readonly marketAnalysisService: MarketAnalysisService) {}

  @Get('municipalities/:ibgeCode')
  @ApiOperation({
    summary: 'Obter análise de mercado de um município',
    description:
      'Combina indicadores socioeconômicos do IBGE com dados de mercado da ANS persistidos no banco.',
  })
  @ApiParam({
    name: 'ibgeCode',
    description: 'Código IBGE do município.',
    example: '2507507',
  })
  @ApiOkResponse({
    description: 'Análise de mercado encontrada.',
  })
  @ApiNotFoundResponse({
    description: 'Município ou dados de mercado não encontrados.',
  })
  async getMunicipalityAnalysis(@Param('ibgeCode') ibgeCode: string) {
    const analysis =
      await this.marketAnalysisService.getMunicipalityAnalysis(ibgeCode);

    if (!analysis) {
      throw new NotFoundException(
        'Município ou dados de mercado não encontrados.',
      );
    }

    return analysis;
  }
}
