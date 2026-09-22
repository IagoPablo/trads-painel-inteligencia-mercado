import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { MarketDataFiltersDto } from './market-data-filters.dto';

export enum MarketDataSortBy {
  POPULATION = 'population',
  HOUSEHOLD_INCOME = 'householdIncome',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindMarketDataDto extends MarketDataFiltersDto {
  @ApiPropertyOptional({
    description: 'Indicador utilizado para ordenar os resultados.',
    enum: MarketDataSortBy,
    example: MarketDataSortBy.POPULATION,
  })
  @IsOptional()
  @IsEnum(MarketDataSortBy, {
    message: 'sortBy deve ser "population" ou "householdIncome".',
  })
  sortBy?: MarketDataSortBy;

  @ApiPropertyOptional({
    description: 'Direção da ordenação.',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, {
    message: 'order deve ser "asc" ou "desc".',
  })
  order?: SortOrder;

  @ApiPropertyOptional({
    description: 'Número da página dos resultados.',
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Quantidade de resultados por página.',
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
