import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { MarketAnalysisService } from './market-analysis.service';

@Controller('market-analysis')
export class MarketAnalysisController {
  constructor(private readonly marketAnalysisService: MarketAnalysisService) {}

  @Get('municipalities/:ibgeCode')
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
