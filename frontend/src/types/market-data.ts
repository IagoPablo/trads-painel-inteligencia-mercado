export interface AgeGroups {
  "0-14": number;
  "15-24": number;
  "25-34": number;
  "35-44": number;
  "45-54": number;
  "55-64": number;
  "65+": number;
}

export interface MarketData {
  municipality: string;
  state: string | null;
  stateCode: string | null;
  ibgeCode: string;
  population: number | null;
  householdIncome: number | null;
  ageGroups: AgeGroups;
  rankingPosition: number | null;
}

export interface MarketDataResponse {
  data: MarketData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MarketDataSummary {
  municipalities: number;
  population: number;
  averageHouseholdIncome: number;
  ageGroups: AgeGroups;
}

export interface AnsAgeGroup {
  medical: number;
  dental: number;
  total: number;
}

export interface MarketAnalysis {
  municipality: {
    code: string;
    name: string;
    state: {
      code: string;
      name: string;
    };
  };

  ibge: {
    referencePeriod: number;
    population: number | null;
    householdIncome: number | null;
    ageGroups: AgeGroups;
  };

  ans: {
    referencePeriod: number;
    beneficiaries: {
      medical: number;
      dental: number;
      total: number;
    };
    ageGroups: Record<string, AnsAgeGroup>;
  };
}
