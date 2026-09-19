jest.mock('../database/prisma.service', () => ({
  PrismaService: class {},
}));

jest.mock('../ibge/ibge.service', () => ({
  IbgeService: class {},
}));

import { BadRequestException } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import {
  MarketDataSortBy,
  SortOrder,
} from './dto/find-market-data.dto';

describe('MarketDataService', () => {
  let service: MarketDataService;

  const prisma = {
    marketIndicator: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    location: {
      findMany: jest.fn(),
    },
  };

  const ibgeService = {};

  beforeEach(() => {
    jest.clearAllMocks();

    service = new MarketDataService(
      prisma as never,
      ibgeService as never,
    );
  });

  it('should reject an invalid state', async () => {
    await expect(
      service.findMarketData({
        state: 'XX',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(
      prisma.marketIndicator.findMany,
    ).not.toHaveBeenCalled();

    expect(
      prisma.marketIndicator.count,
    ).not.toHaveBeenCalled();
  });

  it('should return formatted market data', async () => {
    prisma.marketIndicator.findMany
      .mockResolvedValueOnce([
        {
          locationId: 'location-1',
          location: {
            name: 'João Pessoa',
            ibgeCode: '2507507',
            parent: {
              name: 'Paraíba',
              ibgeCode: '25',
            },
          },
          value: '833932',
        },
      ])
      .mockResolvedValueOnce([
        {
          locationId: 'location-1',
          indicator: 'POPULATION',
          value: '833932',
          dimension: null,
        },
        {
          locationId: 'location-1',
          indicator: 'HOUSEHOLD_INCOME',
          value: '1879',
          dimension: null,
        },
        {
          locationId: 'location-1',
          indicator: 'AGE_GROUP',
          value: '162069',
          dimension: '0-14',
        },
      ]);

    prisma.marketIndicator.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    prisma.marketIndicator.findFirst.mockResolvedValueOnce({
      locationId: 'location-1',
      value: '833932',
    });

    const result = await service.findMarketData({
      state: 'PB',
      municipality: 'João Pessoa',
      sortBy: MarketDataSortBy.POPULATION,
      order: SortOrder.DESC,
    });

    expect(result).toEqual({
      data: [
        {
          municipality: 'João Pessoa',
          state: 'Paraíba',
          stateCode: '25',
          ibgeCode: '2507507',
          population: 833932,
          householdIncome: 1879,
          ageGroups: {
            '0-14': 162069,
          },
          rankingPosition: 1,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    expect(
      prisma.marketIndicator.findMany,
    ).toHaveBeenCalledTimes(2);

    expect(
      prisma.marketIndicator.findFirst,
    ).toHaveBeenCalledTimes(1);

    expect(
      prisma.marketIndicator.count,
    ).toHaveBeenCalledTimes(2);
  });

    it('should calculate ranking correctly when sorting in ascending order', async () => {
    prisma.marketIndicator.findMany
        .mockResolvedValueOnce([
        {
            locationId: 'location-1',
            location: {
            name: 'João Pessoa',
            ibgeCode: '2507507',
            parent: {
                name: 'Paraíba',
                ibgeCode: '25',
            },
            },
            value: '833932',
        },
        ])
        .mockResolvedValueOnce([
        {
            locationId: 'location-1',
            indicator: 'POPULATION',
            value: '833932',
            dimension: null,
        },
        ]);

    prisma.marketIndicator.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

    prisma.marketIndicator.findFirst.mockResolvedValueOnce({
        locationId: 'location-1',
        value: '833932',
    });

    const result = await service.findMarketData({
        state: 'PB',
        municipality: 'João Pessoa',
        sortBy: MarketDataSortBy.POPULATION,
        order: SortOrder.ASC,
    });

    expect(result.data[0].rankingPosition).toBe(3);

    expect(
        prisma.marketIndicator.count,
    ).toHaveBeenCalledTimes(2);

    expect(
        prisma.marketIndicator.findFirst,
    ).toHaveBeenCalledTimes(1);
  });
        it('should calculate the market data summary', async () => {
        prisma.location.findMany.mockResolvedValueOnce([
            {
            id: 'location-1',
            },
            {
            id: 'location-2',
            },
        ]);

        prisma.marketIndicator.findMany.mockResolvedValueOnce([
            {
            locationId: 'location-1',
            indicator: 'POPULATION',
            value: '100000',
            dimension: null,
            },
            {
            locationId: 'location-2',
            indicator: 'POPULATION',
            value: '50000',
            dimension: null,
            },
            {
            locationId: 'location-1',
            indicator: 'HOUSEHOLD_INCOME',
            value: '2000',
            dimension: null,
            },
            {
            locationId: 'location-2',
            indicator: 'HOUSEHOLD_INCOME',
            value: '3000',
            dimension: null,
            },
            {
            locationId: 'location-1',
            indicator: 'AGE_GROUP',
            value: '20000',
            dimension: '0-14',
            },
            {
            locationId: 'location-2',
            indicator: 'AGE_GROUP',
            value: '10000',
            dimension: '0-14',
            },
            {
            locationId: 'location-1',
            indicator: 'AGE_GROUP',
            value: '15000',
            dimension: '15-24',
            },
            {
            locationId: 'location-2',
            indicator: 'AGE_GROUP',
            value: '5000',
            dimension: '15-24',
            },
        ]);

        const result = await service.getMarketDataSummary({
            state: 'PB',
        });

        expect(result).toEqual({
            municipalities: 2,
            population: 150000,
            averageHouseholdIncome: 2500,
            ageGroups: {
            '0-14': 30000,
            '15-24': 20000,
            '25-34': 0,
            '35-44': 0,
            '45-54': 0,
            '55-64': 0,
            '65+': 0,
            },
        });

        expect(
            prisma.location.findMany,
        ).toHaveBeenCalledTimes(1);

        expect(
            prisma.marketIndicator.findMany,
        ).toHaveBeenCalledTimes(1);
    });
    
    it('should return empty summary when no municipalities are found', async () => {
    prisma.location.findMany.mockResolvedValueOnce([]);

    const result = await service.getMarketDataSummary({
        state: 'PB',
    });

    expect(result).toEqual({
        municipalities: 0,
        population: 0,
        averageHouseholdIncome: 0,
        ageGroups: {
        '0-14': 0,
        '15-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45-54': 0,
        '55-64': 0,
        '65+': 0,
        },
    });

    expect(
        prisma.location.findMany,
    ).toHaveBeenCalledTimes(1);

    expect(
        prisma.marketIndicator.findMany,
    ).not.toHaveBeenCalled();
  });
});