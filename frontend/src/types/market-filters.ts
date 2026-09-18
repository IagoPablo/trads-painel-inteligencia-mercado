export type SortBy = 'population' | 'householdIncome';

export type SortOrder = 'asc' | 'desc';

export type AgeGroup =
  | '0-14'
  | '15-24'
  | '25-34'
  | '35-44'
  | '45-54'
  | '55-64'
  | '65+';

export interface MarketFilters {
  state: string;
  municipality: string;
  ageGroup: AgeGroup | '';
  sortBy: SortBy;
  order: SortOrder;
}