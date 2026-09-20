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

    const ansAgeGroups = Object.fromEntries(ageGroups);

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
    };
  }
}
