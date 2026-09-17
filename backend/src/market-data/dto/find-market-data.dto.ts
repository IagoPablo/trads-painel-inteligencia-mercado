import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

enum MarketDataSortBy {
  POPULATION = 'population',
  HOUSEHOLD_INCOME = 'householdIncome',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindMarketDataDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2}$/, {
    message: 'state deve ser uma sigla de UF com 2 letras.',
  })
  
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  state?: string;

  @IsOptional()
  @IsString()
  municipality?: string;

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