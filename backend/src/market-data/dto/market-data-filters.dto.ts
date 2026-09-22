import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class MarketDataFiltersDto {
  @ApiPropertyOptional({
    description: 'Sigla do estado para filtrar os municípios.',
    example: 'PB',
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2}$/, {
    message: 'state deve ser uma sigla de UF com 2 letras.',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  state?: string;

  @ApiPropertyOptional({
    description: 'Nome ou parte do nome do município.',
    example: 'João Pessoa',
  })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiPropertyOptional({
    description: 'Faixa etária utilizada para filtrar os dados.',
    enum: ['0-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    example: '25-34',
  })
  @IsOptional()
  @IsIn(['0-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65+'], {
    message:
      'ageGroup deve ser uma das faixas: 0-14, 15-24, 25-34, 35-44, 45-54, 55-64 ou 65+.',
  })
  ageGroup?: string;
}
