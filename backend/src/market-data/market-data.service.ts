import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IbgeService } from '../ibge/ibge.service';

@Injectable()
export class MarketDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ibgeService: IbgeService,
  ) {}

  async syncPopulation(referencePeriod: number) {
  const data =
    await this.ibgeService.getPopulationByMunicipality(referencePeriod);

  const result = data[0];

  if (!result?.resultados?.[0]?.series) {
    throw new Error('Formato inesperado na resposta do IBGE.');
  }

  const series = result.resultados[0].series;

  const municipalityCodes = series.map(
    (item) => item.localidade.id,
  );

  const locations = await this.prisma.location.findMany({
    where: {
      ibgeCode: {
        in: municipalityCodes,
      },
      type: 'MUNICIPALITY',
    },
    select: {
      id: true,
      ibgeCode: true,
    },
  });

  const locationMap = new Map(
    locations.map((location) => [location.ibgeCode, location.id]),
  );

  const indicators = series
    .map((item) => {
      const locationId = locationMap.get(item.localidade.id);
      const value = item.serie[String(referencePeriod)];

      if (!locationId || value === undefined) {
        return null;
      }

      return {
        locationId,
        indicator: 'POPULATION' as const,
        value,
        unit: result.unidade,
        referencePeriod,
        dimension: null,
        source: 'IBGE',
        ibgeTable: '4714',
        ibgeVariable: '93',
      };
    })
    .filter((indicator): indicator is NonNullable<typeof indicator> => indicator !== null);

  const syncResult = await this.prisma.$transaction(async (transaction) => {
    await transaction.marketIndicator.deleteMany({
      where: {
        indicator: 'POPULATION',
        referencePeriod,
      },
    });

    const created = await transaction.marketIndicator.createMany({
      data: indicators,
    });

    return created.count;
  });

  return {
    ibgeRecords: series.length,
    locationsFound: locations.length,
    locationsMissing: series.length - locations.length,
    indicatorsCreated: syncResult,
  };
}
  async countIndicators() {
    return this.prisma.marketIndicator.count();
 }
  
}