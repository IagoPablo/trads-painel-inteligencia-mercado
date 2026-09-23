import { Injectable } from '@nestjs/common';

import { AnsService } from '../ans/ans.service';
import { MarketDataService } from '../market-data/market-data.service';
import { STATE_CODES } from '../common/constants/state-codes';

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
    const stateTotalBeneficiaries =
      await this.ansService.getStateTotalBeneficiaries(
        ansData.municipality.state.code,
        ansData.referencePeriod,
      );

    const municipalityTotalBeneficiaries = ansData.beneficiaries.total;

    const stateMarketShare =
      stateTotalBeneficiaries > 0
        ? (municipalityTotalBeneficiaries / stateTotalBeneficiaries) * 100
        : null;

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
        marketContext: {
          stateTotalBeneficiaries,
          municipalityTotalBeneficiaries,
          stateMarketShare,
        },

        insights: {
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

      marketContext: {
        stateTotalBeneficiaries,
        municipalityTotalBeneficiaries,
        stateMarketShare,
      },

      insights: {
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
