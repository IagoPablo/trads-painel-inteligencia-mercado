jest.mock('../locations/locations.service', () => ({
  LocationsService: class {},
}));

jest.mock('../market-data/market-data.service', () => ({
  MarketDataService: class {},
}));

import { DataSyncService } from './data-sync.service';

describe('DataSyncService', () => {
  let service: DataSyncService;

  const locationsService = {
    countLocations: jest.fn(),
    syncLocations: jest.fn(),
  };

  const marketDataService = {
    countIndicators: jest.fn(),
    syncPopulation: jest.fn(),
    syncHouseholdIncome: jest.fn(),
    syncAgeGroups: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new DataSyncService(
      locationsService as never,
      marketDataService as never,
    );
  });

  it('should skip synchronization when market data already exists', async () => {
    locationsService.countLocations.mockResolvedValue(5598);
    marketDataService.countIndicators.mockResolvedValue(51560);

    await service.syncInitialData();

    expect(
      locationsService.syncLocations,
    ).not.toHaveBeenCalled();

    expect(
      marketDataService.syncPopulation,
    ).not.toHaveBeenCalled();

    expect(
      marketDataService.syncHouseholdIncome,
    ).not.toHaveBeenCalled();

    expect(
      marketDataService.syncAgeGroups,
    ).not.toHaveBeenCalled();
  });

  it('should synchronize all market data when database is empty', async () => {
    locationsService.countLocations.mockResolvedValue(0);
    marketDataService.countIndicators.mockResolvedValue(0);

    const syncOrder: string[] = [];

    locationsService.syncLocations.mockImplementation(
        async () => {
        syncOrder.push('locations');
        },
    );

    marketDataService.syncPopulation.mockImplementation(
        async () => {
        syncOrder.push('population');
        },
    );

    marketDataService.syncHouseholdIncome.mockImplementation(
        async () => {
        syncOrder.push('householdIncome');
        },
    );

    marketDataService.syncAgeGroups.mockImplementation(
        async () => {
        syncOrder.push('ageGroups');
        },
    );

    await service.syncInitialData();

    expect(
        locationsService.syncLocations,
    ).toHaveBeenCalledTimes(1);

    expect(
        marketDataService.syncPopulation,
    ).toHaveBeenCalledWith(2022);

    expect(
        marketDataService.syncHouseholdIncome,
    ).toHaveBeenCalledWith(2022);

    expect(
        marketDataService.syncAgeGroups,
    ).toHaveBeenCalledWith(2022);

    expect(syncOrder).toEqual([
        'locations',
        'population',
        'householdIncome',
        'ageGroups',
    ]);
  });
});