export type SortBy = "population" | "householdIncome";

export type SortOrder = "asc" | "desc";

export type AgeGroup =
  | "0-14"
  | "15-24"
  | "25-34"
  | "35-44"
  | "45-54"
  | "55-64"
  | "65+";

export interface MarketFilters {
  state: string;
  municipality: string;
  ageGroup: AgeGroup | "";
  sortBy: SortBy;
  order: SortOrder;
}
export const IBGE_STATE_CODE_TO_UF: Record<string, string> = {
  "11": "RO",
  "12": "AC",
  "13": "AM",
  "14": "RR",
  "15": "PA",
  "16": "AP",
  "17": "TO",
  "21": "MA",
  "22": "PI",
  "23": "CE",
  "24": "RN",
  "25": "PB",
  "26": "PE",
  "27": "AL",
  "28": "SE",
  "29": "BA",
  "31": "MG",
  "32": "ES",
  "33": "RJ",
  "35": "SP",
  "41": "PR",
  "42": "SC",
  "43": "RS",
  "50": "MS",
  "51": "MT",
  "52": "GO",
  "53": "DF",
};
