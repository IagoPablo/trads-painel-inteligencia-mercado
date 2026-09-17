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

async syncHouseholdIncome(referencePeriod: number) {
  const result =
    await this.ibgeService.getHouseholdIncomeByMunicipality(
      referencePeriod,
    );

  const series = result?.[0]?.resultados?.[0]?.series;

  if (!Array.isArray(series)) {
    throw new Error('Resposta inesperada da API do IBGE.');
  }

  const locations = await this.prisma.location.findMany({
    where: {
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
      const value = item.serie?.[String(referencePeriod)];

      if (!locationId || value === undefined || value === null) {
        return null;
      }

      return {
        locationId,
        indicator: 'HOUSEHOLD_INCOME' as const,
        value: String(value),
        unit: 'Reais',
        referencePeriod,
        dimension: null,
        source: 'IBGE',
        ibgeTable: '10295',
        ibgeVariable: '13431',
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  await this.prisma.$transaction(async (tx) => {
    await tx.marketIndicator.deleteMany({
      where: {
        indicator: 'HOUSEHOLD_INCOME',
        referencePeriod,
      },
    });

    if (indicators.length > 0) {
      await tx.marketIndicator.createMany({
        data: indicators,
      });
    }
  });

  return {
    ibgeRecords: series.length,
    locationsFound: indicators.length,
    locationsMissing: series.length - indicators.length,
    indicatorsCreated: indicators.length,
  };
 }
 
  private splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return batches;
 }

 async syncAgeGroups(referencePeriod: number) {
  const locations = await this.prisma.location.findMany({
    where: {
      type: 'MUNICIPALITY',
    },
    select: {
      id: true,
      ibgeCode: true,
      parentId: true,
    },
  });

  const batchSize = 50;

  const locationMap = new Map(
    locations.map((location) => [location.ibgeCode, location]),
  ); 
  
  const municipalitiesByState = new Map<string, string[]>();

  for (const location of locations) {
    if (!location.parentId) {
      continue;
    }

    const municipalities =
      municipalitiesByState.get(location.parentId) ?? [];

    municipalities.push(location.ibgeCode);

    municipalitiesByState.set(location.parentId, municipalities);
  }

  const ageGroups = [
    {
      dimension: '0-14',
      sourceCodes: ['93070', '93084', '93085'],
    },
    {
      dimension: '15-24',
      sourceCodes: ['93086', '93087'],
    },
    {
      dimension: '25-34',
      sourceCodes: ['93088', '93089'],
    },
    {
      dimension: '35-44',
      sourceCodes: ['93090', '93091'],
    },
    {
      dimension: '45-54',
      sourceCodes: ['93092', '93093'],
    },
    {
      dimension: '55-64',
      sourceCodes: ['93094', '93095'],
    },
    {
      dimension: '65+',
      sourceCodes: [
        '93096',
        '93097',
        '93098',
        '49108',
        '49109',
        '60040',
        '60041',
        '6653',
      ],
    },
  ];

  const indicators: {
    locationId: string;
    indicator: 'AGE_GROUP';
    value: string;
    unit: string;
    referencePeriod: number;
    dimension: string;
    source: string;
    ibgeTable: string;
    ibgeVariable: string;
  }[] = [];

  let ibgeRecords = 0;

  for (const municipalityCodes of municipalitiesByState.values()) {
  const batches = this.splitIntoBatches(
    municipalityCodes,
    batchSize,
  );

  for (const batch of batches) {
    const result =
      await this.ibgeService.getAgeGroupsByMunicipalities(
        batch,
        referencePeriod,
      );

    const results = result?.[0]?.resultados;

    if (!Array.isArray(results)) {
      throw new Error('Formato inesperado na resposta do IBGE.');
    }

    ibgeRecords += results.length;

    for (const resultItem of results) {
      const ageClassification = resultItem.classificacoes?.find(
        (classification) => classification.id === '287',
      );

      if (!ageClassification?.categoria) {
        continue;
      }

      const ageCategoryCodes = Object.keys(
        ageClassification.categoria,
      );

      const ageCategoryCode = ageCategoryCodes[0];

      if (!ageCategoryCode) {
        continue;
      }

      const targetGroup = ageGroups.find((group) =>
        group.sourceCodes.includes(ageCategoryCode),
      );

      if (!targetGroup) {
        continue;
      }

      const series = resultItem.series;

      if (!Array.isArray(series)) {
        continue;
      }

      for (const serie of series) {
        const location = locationMap.get(serie.localidade.id);

        if (!location) {
          continue;
        }

  const rawValue = serie.serie?.[String(referencePeriod)];

  if (rawValue === undefined || rawValue === null) {
  continue;
 }

      const numericValue = Number(rawValue);

      if (!Number.isFinite(numericValue)) {
        continue;
      }

        const existing = indicators.find(
          (indicator) =>
            indicator.locationId === location.id &&
            indicator.dimension === targetGroup.dimension,
        );

        if (existing) {
          existing.value = String(
            Number(existing.value) + Number(numericValue),
          );
        } else {
          indicators.push({
            locationId: location.id,
            indicator: 'AGE_GROUP',
            value: String(numericValue),
            unit: 'Pessoas',
            referencePeriod,
            dimension: targetGroup.dimension,
            source: 'IBGE',
            ibgeTable: '9514',
            ibgeVariable: '93',
          });
        }
      }
    }
  }
 }

 await this.prisma.$transaction(
    async (tx) => {
      await tx.marketIndicator.deleteMany({
        where: {
          indicator: 'AGE_GROUP',
          referencePeriod,
        },
      });


    if (indicators.length > 0) {
        await tx.marketIndicator.createMany({
          data: indicators,
        });
      }
    },
    {
      timeout: 60000,
    },
  );

  return {
    ibgeRecords,
    indicatorsCreated: indicators.length,
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

  const locationWhere = {
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
  };

  const sortIndicator =
  filters.sortBy === 'householdIncome'
    ? 'HOUSEHOLD_INCOME'
    : 'POPULATION';

  const order = filters.order === 'asc' ? 'asc' : 'desc';

  const [sortedIndicators, total] = await Promise.all([
    this.prisma.marketIndicator.findMany({
      where: {
        indicator: sortIndicator,
        referencePeriod: 2022,
        location: locationWhere,
      },
      include: {
        location: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: {
        value: order,
      },
      skip,
      take: limit,
  }),

  this.prisma.marketIndicator.count({
    where: {
      indicator: sortIndicator,
      referencePeriod: 2022,
      location: locationWhere,
     },
   }),
 ]);

  const locationIds = sortedIndicators.map((item) => item.locationId);

  const otherIndicators = await this.prisma.marketIndicator.findMany({
    where: {
      locationId: {
        in: locationIds,
      },
      indicator: {
        in: ['POPULATION', 'HOUSEHOLD_INCOME', 'AGE_GROUP'],
      },
      referencePeriod: 2022,
   },
 });

  const indicatorsByLocation = new Map<string, typeof otherIndicators>();

  for (const indicator of otherIndicators) {
    const current = indicatorsByLocation.get(indicator.locationId) ?? [];

    current.push(indicator);

    indicatorsByLocation.set(indicator.locationId, current);
  }

  const data = sortedIndicators.map((item) => {
  const indicators = indicatorsByLocation.get(item.locationId) ?? [];

  const populationIndicator = indicators.find(
    (indicator) => indicator.indicator === 'POPULATION',
  );

  const householdIncomeIndicator = indicators.find(
    (indicator) => indicator.indicator === 'HOUSEHOLD_INCOME',
  );

  const ageIndicators = indicators.filter(
    (indicator) => indicator.indicator === 'AGE_GROUP',
  );

  const ageGroups = Object.fromEntries(
    ageIndicators.map((indicator) => [
      indicator.dimension,
      Number(indicator.value),
    ]),
  );

    return {
      municipality: item.location.name,
      state: item.location.parent?.name ?? null,
      stateCode: item.location.parent?.ibgeCode ?? null,
      ibgeCode: item.location.ibgeCode,
      population: populationIndicator
        ? Number(populationIndicator.value)
        : null,
      householdIncome: householdIncomeIndicator
        ? Number(householdIncomeIndicator.value)
        : null,
      ageGroups,
    };
  });

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