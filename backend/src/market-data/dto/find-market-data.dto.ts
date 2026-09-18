import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { MarketDataFiltersDto } from './market-data-filters.dto';

enum MarketDataSortBy {
  POPULATION = 'population',
  HOUSEHOLD_INCOME = 'householdIncome',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindMarketDataDto extends MarketDataFiltersDto {
  @IsOptional()
  @IsEnum(MarketDataSortBy, {
    message: 'sortBy deve ser "population" ou "householdIncome".',
  })
  sortBy?: MarketDataSortBy;

  @IsOptional()
  @IsEnum(SortOrder, {
    message: 'order deve ser "asc" ou "desc".',
  })
  order?: SortOrder;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}