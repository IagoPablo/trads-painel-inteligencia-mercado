jest.mock('../ans/ans.service', () => ({
  AnsService: class AnsService {},
}));

jest.mock('../market-data/market-data.service', () => ({
  MarketDataService: class MarketDataService {},
}));

import { MarketAnalysisService } from './market-analysis.service';

describe('MarketAnalysisService', () => {
  let service: MarketAnalysisService;

  const marketDataService = {
    getMunicipalityMarketData: jest.fn(),
  };

  const ansService = {
    getMunicipalityData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new MarketAnalysisService(
      marketDataService as any,
      ansService as any,
    );
  });

  it('should return null when municipality data is not found', async () => {
    marketDataService.getMunicipalityMarketData.mockResolvedValue(null);
    ansService.getMunicipalityData.mockResolvedValue(null);

    const result = await service.getMunicipalityAnalysis('2507507');

    expect(result).toBeNull();
  });

  it('should combine IBGE and ANS data into a market analysis', async () => {
    marketDataService.getMunicipalityMarketData.mockResolvedValue({
      municipality: {
        code: '2507507',
        name: 'João Pessoa',
        state: {
          code: '25',
          name: 'Paraíba',
        },
      },
      referencePeriod: 2022,
      population: 833932,
      householdIncome: 1879,
      ageGroups: {
        '0-14': 162069,
        '15-24': 120159,
        '25-34': 132691,
        '35-44': 139017,
        '45-54': 108331,
        '55-64': 87085,
        '65+': 84580,
      },
    });

    ansService.getMunicipalityData.mockResolvedValue({
      referencePeriod: 2026,
      beneficiaries: {
        medical: 279715,
        dental: 384206,
        total: 663921,
      },
      profiles: [
        {
          sex: 'FEMININO',
          ageGroup: '30 a 39 anos',
          beneficiariesMedical: 27402,
          beneficiariesDental: 42281,
          beneficiariesTotal: 69683,
        },
        {
          sex: 'MASCULINO',
          ageGroup: '30 a 39 anos',
          beneficiariesMedical: 20456,
          beneficiariesDental: 37974,
          beneficiariesTotal: 58430,
        },
        {
          sex: 'FEMININO',
          ageGroup: '20 a 29 anos',
          beneficiariesMedical: 18477,
          beneficiariesDental: 34780,
          beneficiariesTotal: 53257,
        },
        {
          sex: 'MASCULINO',
          ageGroup: '20 a 29 anos',
          beneficiariesMedical: 15206,
          beneficiariesDental: 33363,
          beneficiariesTotal: 48569,
        },
        {
          sex: 'FEMININO',
          ageGroup: 'Inconsistente',
          beneficiariesMedical: 0,
          beneficiariesDental: 0,
          beneficiariesTotal: 0,
        },
      ],
    });

    const result = await service.getMunicipalityAnalysis('2507507');

    expect(result).toEqual({
      municipality: {
        code: '2507507',
        name: 'João Pessoa',
        state: {
          code: '25',
          name: 'Paraíba',
        },
      },

      ibge: {
        referencePeriod: 2022,
        population: 833932,
        householdIncome: 1879,
        ageGroups: {
          '0-14': 162069,
          '15-24': 120159,
          '25-34': 132691,
          '35-44': 139017,
          '45-54': 108331,
          '55-64': 87085,
          '65+': 84580,
        },
      },

      ans: {
        referencePeriod: 2026,
        beneficiaries: {
          medical: 279715,
          dental: 384206,
          total: 663921,
        },
        ageGroups: {
          '30 a 39 anos': {
            medical: 47858,
            dental: 80255,
            total: 128113,
          },
          '20 a 29 anos': {
            medical: 33683,
            dental: 68143,
            total: 101826,
          },
        },
      },

      insights: {
        largestPopulationAgeGroup: {
          ageGroup: '0-14',
          population: 162069,
        },

        largestBeneficiaryAgeGroup: {
          ageGroup: '30 a 39 anos',
          beneficiaries: 128113,
        },

        largestMedicalAgeGroup: {
          ageGroup: '30 a 39 anos',
          beneficiaries: 47858,
        },

        largestDentalAgeGroup: {
          ageGroup: '30 a 39 anos',
          beneficiaries: 80255,
        },
      },
    });
  });

  it('should ignore inconsistent ANS age groups', async () => {
    marketDataService.getMunicipalityMarketData.mockResolvedValue({
      municipality: {
        code: '2507507',
        name: 'João Pessoa',
        state: {
          code: '25',
          name: 'Paraíba',
        },
      },
      referencePeriod: 2022,
      population: 833932,
      householdIncome: 1879,
      ageGroups: {
        '0-14': 162069,
        '15-24': 120159,
        '25-34': 132691,
        '35-44': 139017,
        '45-54': 108331,
        '55-64': 87085,
        '65+': 84580,
      },
    });

    ansService.getMunicipalityData.mockResolvedValue({
      referencePeriod: 2026,
      beneficiaries: {
        medical: 100,
        dental: 200,
        total: 300,
      },
      profiles: [
        {
          sex: 'FEMININO',
          ageGroup: 'Inconsistente',
          beneficiariesMedical: 999,
          beneficiariesDental: 999,
          beneficiariesTotal: 1998,
        },
      ],
    });

    const result = await service.getMunicipalityAnalysis('2507507');

    expect(result?.ans.ageGroups).toEqual({});
  });
});
