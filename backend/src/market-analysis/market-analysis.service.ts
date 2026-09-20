import { Injectable } from '@nestjs/common';

import { AnsService } from '../ans/ans.service';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable()
export class MarketAnalysisService {
  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly ansService: AnsService,
  ) {}

  async getMunicipalityAnalysis(ibgeCode: string) {
    const [marketData, ansData] = await Promise.all([
      this.marketDataService.getMunicipalityMarketData(ibgeCode),
      this.ansService.getMunicipalityData(ibgeCode),
    ]);

    if (!marketData || !ansData) {
      return null;
    }

    const ageGroups = new Map<
      string,
      {
        medical: number;
        dental: number;
        total: number;
      }
    >();

    for (const profile of ansData.profiles) {
      if (profile.ageGroup === 'Inconsistente') {
        continue;
      }

      const current = ageGroups.get(profile.ageGroup) ?? {
        medical: 0,
        dental: 0,
        total: 0,
      };

      current.medical += profile.beneficiariesMedical;
      current.dental += profile.beneficiariesDental;
      current.total += profile.beneficiariesTotal;

      ageGroups.set(profile.ageGroup, current);
    }

    const ansAgeGroups: Record<
      string,
      {
        medical: number;
        dental: number;
        total: number;
      }
    > = Object.fromEntries(ageGroups);

    const populationAgeGroups = Object.entries(marketData.ageGroups) as [
      string,
      number,
    ][];

    const populationAgeGroup = populationAgeGroups.reduce((highest, current) =>
      current[1] > highest[1] ? current : highest,
    );

    const ansAgeGroupEntries = Object.entries(ansAgeGroups) as [
      string,
      {
        medical: number;
        dental: number;
        total: number;
      },
    ][];

    if (ansAgeGroupEntries.length === 0) {
      return {
        municipality: marketData.municipality,

        ibge: {
          referencePeriod: marketData.referencePeriod,
          population: marketData.population,
          householdIncome: marketData.householdIncome,
          ageGroups: marketData.ageGroups,
        },

        ans: {
          referencePeriod: ansData.referencePeriod,
          beneficiaries: ansData.beneficiaries,
          ageGroups: ansAgeGroups,
        },

        insights: {
          largestPopulationAgeGroup: {
            ageGroup: populationAgeGroup[0],
            population: populationAgeGroup[1],
          },

          largestBeneficiaryAgeGroup: null,
          largestMedicalAgeGroup: null,
          largestDentalAgeGroup: null,
        },
      };
    }

    const beneficiaryAgeGroup = ansAgeGroupEntries.reduce((highest, current) =>
      current[1].total > highest[1].total ? current : highest,
    );

    const largestMedicalAgeGroup = ansAgeGroupEntries.reduce(
      (highest, current) =>
        current[1].medical > highest[1].medical ? current : highest,
    );

    const largestDentalAgeGroup = ansAgeGroupEntries.reduce(
      (highest, current) =>
        current[1].dental > highest[1].dental ? current : highest,
    );

    return {
      municipality: marketData.municipality,

      ibge: {
        referencePeriod: marketData.referencePeriod,
        population: marketData.population,
        householdIncome: marketData.householdIncome,
        ageGroups: marketData.ageGroups,
      },

      ans: {
        referencePeriod: ansData.referencePeriod,
        beneficiaries: ansData.beneficiaries,
        ageGroups: ansAgeGroups,
      },

      insights: {
        largestPopulationAgeGroup: {
          ageGroup: populationAgeGroup[0],
          population: populationAgeGroup[1],
        },

        largestBeneficiaryAgeGroup: {
          ageGroup: beneficiaryAgeGroup[0],
          beneficiaries: beneficiaryAgeGroup[1].total,
        },

        largestMedicalAgeGroup: {
          ageGroup: largestMedicalAgeGroup[0],
          beneficiaries: largestMedicalAgeGroup[1].medical,
        },

        largestDentalAgeGroup: {
          ageGroup: largestDentalAgeGroup[0],
          beneficiaries: largestDentalAgeGroup[1].dental,
        },
      },
    };
  }
}
