import { ApiProperty } from '@nestjs/swagger';

export class AnsMunicipalRecordDto {
  @ApiProperty({
    description: 'Período de referência dos dados da ANS.',
    example: 2026,
  })
  period!: number;

  @ApiProperty({
    description: 'Código do município utilizado no mapeamento com o IBGE.',
    example: '2507507',
  })
  municipalityCode!: string;

  @ApiProperty({
    description: 'Nome do município.',
    example: 'João Pessoa',
  })
  municipalityName!: string;

  @ApiProperty({
    description: 'Código da unidade federativa.',
    example: '25',
  })
  stateCode!: string;

  @ApiProperty({
    description: 'Sigla da unidade federativa.',
    example: 'PB',
  })
  stateAbbreviation!: string;

  @ApiProperty({
    description: 'Sexo utilizado no recorte dos dados.',
    example: 'FEMININO',
  })
  sex!: string;

  @ApiProperty({
    description: 'Faixa etária utilizada no recorte dos dados.',
    example: '20 a 29 anos',
  })
  ageGroup!: string;

  @ApiProperty({
    description: 'Quantidade de beneficiários de assistência médica.',
    example: 12500,
  })
  beneficiariesMedical!: number;

  @ApiProperty({
    description: 'Quantidade de beneficiários de assistência odontológica.',
    example: 8300,
  })
  beneficiariesDental!: number;

  @ApiProperty({
    description: 'Quantidade total de beneficiários.',
    example: 20800,
  })
  beneficiariesTotal!: number;
}