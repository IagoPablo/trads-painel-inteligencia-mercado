export class AnsMunicipalRecordDto {
  period!: number;
  municipalityCode!: string;
  municipalityName!: string;
  stateCode!: string;
  stateAbbreviation!: string;

  sex!: string;
  ageGroup!: string;

  beneficiariesMedical!: number;
  beneficiariesDental!: number;
  beneficiariesTotal!: number;
}