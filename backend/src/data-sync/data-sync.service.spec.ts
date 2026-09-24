jest.mock('../locations/locations.service', () => ({
  LocationsService: class {},
}));

jest.mock('../market-data/market-data.service', () => ({
  MarketDataService: class {},
}));

jest.mock('../ans/ans.service', () => ({
  AnsService: class {},
}));

import { DataSyncService } from './data-sync.service';

describe('DataSyncService', () => {
  let service: DataSyncService;

  const locationsService = {
    countLocations: jest.fn(),
    syncLocations: jest.fn(),
  };

  const marketDataService = {
    hasRequiredIndicators: jest.fn(),
    syncPopulation: jest.fn(),
    syncHouseholdIncome: jest.fn(),
    syncAgeGroups: jest.fn(),
  };

  const ansService = {
    hasData: jest.fn(),
    syncCoverageData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new DataSyncService(
      locationsService as never,
      marketDataService as never,
      ansService as never,
    );
  });

  it('should skip synchronization when required market data already exists', async () => {
    locationsService.countLocations.mockResolvedValue(5598);
    marketDataService.hasRequiredIndicators.mockResolvedValue(true);
    ansService.hasData.mockResolvedValue(true);

    await service.syncInitialData();

    expect(locationsService.syncLocations).not.toHaveBeenCalled();

    expect(marketDataService.syncPopulation).not.toHaveBeenCalled();

    expect(marketDataService.syncHouseholdIncome).not.toHaveBeenCalled();

    expect(marketDataService.syncAgeGroups).not.toHaveBeenCalled();

    expect(ansService.syncCoverageData).not.toHaveBeenCalled();
  });

  it('should synchronize all market data when database is empty', async () => {
    locationsService.countLocations.mockResolvedValue(0);
    marketDataService.hasRequiredIndicators.mockResolvedValue(false);
    ansService.hasData.mockResolvedValue(false);

    const syncOrder: string[] = [];

    locationsService.syncLocations.mockImplementation(async () => {
      syncOrder.push('locations');
    });

    marketDataService.syncPopulation.mockImplementation(async () => {
      syncOrder.push('population');
    });

    marketDataService.syncHouseholdIncome.mockImplementation(async () => {
      syncOrder.push('householdIncome');
    });

    marketDataService.syncAgeGroups.mockImplementation(async () => {
      syncOrder.push('ageGroups');
    });

    ansService.syncCoverageData.mockImplementation(async () => {
      syncOrder.push('ans');
      return {
        profiles: 144846,
        municipalities: 5571,
      };
    });

    await service.syncInitialData();

    expect(locationsService.syncLocations).toHaveBeenCalledTimes(1);

    expect(marketDataService.syncPopulation).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncHouseholdIncome).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncAgeGroups).toHaveBeenCalledWith(2022);

    expect(ansService.syncCoverageData).toHaveBeenCalledTimes(1);

    expect(syncOrder).toEqual([
      'locations',
      'population',
      'householdIncome',
      'ageGroups',
      'ans',
    ]);
  });

  it('should synchronize again when market data is incomplete', async () => {
    locationsService.countLocations.mockResolvedValue(5598);
    marketDataService.hasRequiredIndicators.mockResolvedValue(false);
    ansService.hasData.mockResolvedValue(true);

    await service.syncInitialData();

    expect(locationsService.syncLocations).not.toHaveBeenCalled();

    expect(marketDataService.syncPopulation).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncHouseholdIncome).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncAgeGroups).toHaveBeenCalledWith(2022);

    expect(ansService.syncCoverageData).not.toHaveBeenCalled();
  });

  it('should synchronize ANS when IBGE data is already complete', async () => {
    locationsService.countLocations.mockResolvedValue(5598);
    marketDataService.hasRequiredIndicators.mockResolvedValue(true);
    ansService.hasData.mockResolvedValue(false);

    ansService.syncCoverageData.mockResolvedValue({
      profiles: 144846,
      municipalities: 5571,
    });

    await service.syncInitialData();

    expect(locationsService.syncLocations).not.toHaveBeenCalled();

    expect(marketDataService.syncPopulation).not.toHaveBeenCalled();

    expect(marketDataService.syncHouseholdIncome).not.toHaveBeenCalled();

    expect(marketDataService.syncAgeGroups).not.toHaveBeenCalled();

    expect(ansService.syncCoverageData).toHaveBeenCalledTimes(1);
  });

  it('should continue when ANS synchronization fails', async () => {
    locationsService.countLocations.mockResolvedValue(5598);
    marketDataService.hasRequiredIndicators.mockResolvedValue(true);
    ansService.hasData.mockResolvedValue(false);

    ansService.syncCoverageData.mockRejectedValue(new Error('ANS unavailable'));

    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation(() => undefined);

    await expect(service.syncInitialData()).resolves.toBeUndefined();

    expect(ansService.syncCoverageData).toHaveBeenCalledTimes(1);

    expect(locationsService.syncLocations).not.toHaveBeenCalled();
    expect(marketDataService.syncPopulation).not.toHaveBeenCalled();
    expect(marketDataService.syncHouseholdIncome).not.toHaveBeenCalled();
    expect(marketDataService.syncAgeGroups).not.toHaveBeenCalled();

    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);

    loggerErrorSpy.mockRestore();
  });

  it('should synchronize IBGE data for the configured reference period', async () => {
    await service.syncIbgeData(2022);

    expect(marketDataService.syncPopulation).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncHouseholdIncome).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncAgeGroups).toHaveBeenCalledWith(2022);
  });

  it('should continue handling scheduled IBGE synchronization when it succeeds', async () => {
    await service.handleIbgeSync();

    expect(marketDataService.syncPopulation).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncHouseholdIncome).toHaveBeenCalledWith(2022);

    expect(marketDataService.syncAgeGroups).toHaveBeenCalledWith(2022);
  });
  it('should handle errors during scheduled IBGE synchronization', async () => {
    marketDataService.syncPopulation.mockRejectedValue(
      new Error('IBGE unavailable'),
    );

    const loggerErrorSpy = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation(() => undefined);

    await expect(service.handleIbgeSync()).resolves.toBeUndefined();

    expect(marketDataService.syncPopulation).toHaveBeenCalledWith(2022);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Falha na atualização agendada dos dados do IBGE.',
      expect.stringContaining('IBGE unavailable'),
    );

    loggerErrorSpy.mockRestore();
  });
});
