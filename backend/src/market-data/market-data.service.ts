import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IbgeService } from '../ibge/ibge.service';
import { FindMarketDataDto } from './dto/find-market-data.dto';

@Injectable()
export class MarketDataService {
  private readonly stateCodes: Record<string, string> = {
    AC: '12',
    AL: '27',
    AP: '16',
    AM: '13',
    BA: '29',
    CE: '23',
    DF: '53',
    ES: '32',
    GO: '52',
    MA: '21',
    MT: '51',
    MS: '50',
    MG: '31',
    PA: '15',
    PB: '25',
    PR: '41',
    PE: '26',
    PI: '22',
    RJ: '33',
    RN: '24',
    RS: '43',
    RO: '11',
    RR: '14',
    SC: '42',
    SP: '35',
    SE: '28',
    TO: '17',
    };
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

  async findMarketData(filters: FindMarketDataDto) {
  const stateCode = filters.state
    ? this.stateCodes[filters.state.toUpperCase()]
    : undefined;

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    indicator: 'POPULATION' as const,
    referencePeriod: 2022,
    location: {
      type: 'MUNICIPALITY' as const,
      name: filters.municipality
        ? {
            equals: filters.municipality,
            mode: 'insensitive' as const,
          }
        : undefined,
      parent: stateCode
        ? {
            ibgeCode: stateCode,
          }
        : undefined,
    },
  };

  const [indicators, total] = await Promise.all([
    this.prisma.marketIndicator.findMany({
      where,
      include: {
        location: {
          include: {
            parent: true,
          },
        },
      },
      orderBy:
        filters.sortBy === 'population'
          ? {
              value: filters.order === 'asc' ? 'asc' : 'desc',
            }
          : undefined,
      skip,
      take: limit,
    }),
    this.prisma.marketIndicator.count({ where }),
  ]);

  const data = indicators.map((item) => ({
    municipality: item.location.name,
    state: item.location.parent?.name ?? null,
    stateCode: item.location.parent?.ibgeCode ?? null,
    ibgeCode: item.location.ibgeCode,
    population: Number(item.value),
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
 }
}