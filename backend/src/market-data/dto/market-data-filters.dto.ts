import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class MarketDataFiltersDto {
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
  @IsIn([
    '0-14',
    '15-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65+',
  ], {
    message:
      'ageGroup deve ser uma das faixas: 0-14, 15-24, 25-34, 35-44, 45-54, 55-64 ou 65+.',
  })
  ageGroup?: string;
}