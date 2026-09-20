import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

import { Readable } from 'node:stream';
import { parse } from 'csv-parse';
import { PrismaService } from '../database/prisma.service';
import { LocationsService } from '../locations/locations.service';
import { AnsMunicipalRecordDto } from './dto/ans-municipal-record.dto';

@Injectable()
export class AnsService {
  private readonly logger = new Logger(AnsService.name);

  private readonly csvUrl =
    process.env.ANS_COVERAGE_CSV_URL ??
    'https://dadosabertos.ans.gov.br/FTP/PDA/taxa_de_cobertura_de_planos_de_saude-047/pda-047-taxa_cobertura.csv';

  constructor(
    private readonly prisma: PrismaService,
    private readonly locationsService: LocationsService,
  ) {}

  async downloadCsv() {
    if (!this.csvUrl) {
      throw new ServiceUnavailableException(
        'ANS_COVERAGE_CSV_URL não configurada.',
      );
    }

    const response = await fetch(this.csvUrl);

    if (!response.ok || !response.body) {
      throw new ServiceUnavailableException(
        `Falha ao baixar dados da ANS. HTTP ${response.status}.`,
      );
    }

    return response.body.pipeThrough(new TextDecoderStream('windows-1252'));
  }

  private parseNumber(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value !== 'string') {
      return 0;
    }

    const normalized = value.trim().replace(/\./g, '').replace(',', '.');

    if (!normalized || normalized === '-1') {
      return 0;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').trim();
  }

  private normalizeMunicipalityCode(value: unknown): string | null {
    const code = this.normalizeText(value);

    if (!/^\d{6}$/.test(code)) {
      return null;
    }

    return code;
  }

  private parseRecord(
    row: Record<string, string>,
  ): AnsMunicipalRecordDto | null {
    const municipalityCode = this.normalizeMunicipalityCode(row.CD_MUNICIPIO);

    if (!municipalityCode) {
      return null;
    }

    const period = Number(this.normalizeText(row.PERIODO));

    if (!Number.isInteger(period) || period <= 0) {
      return null;
    }

    return {
      period,
      municipalityCode,
      municipalityName: this.normalizeText(row.NM_MUNICIPIO),
      stateCode: this.normalizeText(row.CD_UF),
      stateAbbreviation: this.normalizeText(row.SG_UF),
      sex: this.normalizeText(row.SEXO),
      ageGroup: this.normalizeText(row.FAIXA_ETARIA),
      beneficiariesMedical: this.parseNumber(row.BENEF_ASSISTENCIA_MEDICA),
      beneficiariesDental: this.parseNumber(row.BENEF_EXCLUS_ODONTOLOGICO),
      beneficiariesTotal: this.parseNumber(row.BENEF_TOTAL),
    };
  }

  async *readRecords(
    stream: Parameters<typeof Readable.fromWeb>[0],
  ): AsyncGenerator<AnsMunicipalRecordDto> {
    const nodeStream = Readable.fromWeb(stream);

    const parser = nodeStream.pipe(
      parse({
        columns: true,
        delimiter: ';',
        skip_empty_lines: true,
        trim: true,
        bom: true,
      }),
    );

    for await (const row of parser) {
      const record = this.parseRecord(row as Record<string, string>);

      if (record) {
        yield record;
      }
    }
  }

  private async buildAnsLocationMap() {
    const municipalities =
      await this.locationsService.getMunicipalitiesForAnsMapping();

    const locationMap = new Map<
      string,
      {
        id: string;
        ibgeCode: string;
        name: string;
      }
    >();

    for (const municipality of municipalities) {
      if (!municipality.parent) {
        continue;
      }

      const ansCode = municipality.ibgeCode.slice(0, 6);
      const stateCode = municipality.parent.ibgeCode;

      const key = `${ansCode}|${stateCode}`;

      locationMap.set(key, {
        id: municipality.id,
        ibgeCode: municipality.ibgeCode,
        name: municipality.name,
      });
    }

    return locationMap;
  }

  private buildAnsProfileKey(
    locationId: string,
    record: AnsMunicipalRecordDto,
  ): string {
    return [locationId, record.period, record.sex, record.ageGroup].join('|');
  }

  private resolveDuplicateRecord(
    existing: AnsMunicipalRecordDto,
    incoming: AnsMunicipalRecordDto,
  ): AnsMunicipalRecordDto {
    const existingIsZero =
      existing.beneficiariesMedical === 0 &&
      existing.beneficiariesDental === 0 &&
      existing.beneficiariesTotal === 0;

    const incomingIsZero =
      incoming.beneficiariesMedical === 0 &&
      incoming.beneficiariesDental === 0 &&
      incoming.beneficiariesTotal === 0;

    if (existingIsZero && !incomingIsZero) {
      return incoming;
    }

    if (!existingIsZero && incomingIsZero) {
      return existing;
    }

    return existing;
    
  }

  private async processCoverageRecords() {
    const stream = await this.downloadCsv();

    const locationMap = await this.buildAnsLocationMap();

    const profiles = new Map<
      string,
      {
        locationId: string;
        period: number;
        sex: string;
        ageGroup: string;
        beneficiariesMedical: number;
        beneficiariesDental: number;
        beneficiariesTotal: number;
      }
    >();

    for await (const record of this.readRecords(
      stream as Parameters<typeof this.readRecords>[0],
    )) {
      const locationKey = `${record.municipalityCode}|${record.stateCode}`;

      const location = locationMap.get(locationKey);

      if (!location) {
        continue;
      }

      const profileKey = this.buildAnsProfileKey(location.id, record);

      const existing = profiles.get(profileKey);

      if (!existing) {
        profiles.set(profileKey, {
          locationId: location.id,
          period: record.period,
          sex: record.sex,
          ageGroup: record.ageGroup,
          beneficiariesMedical: record.beneficiariesMedical,
          beneficiariesDental: record.beneficiariesDental,
          beneficiariesTotal: record.beneficiariesTotal,
        });

        continue;
      }

      const resolved = this.resolveDuplicateRecord(
        {
          period: existing.period,
          municipalityCode: record.municipalityCode,
          municipalityName: record.municipalityName,
          stateCode: record.stateCode,
          stateAbbreviation: record.stateAbbreviation,
          sex: existing.sex,
          ageGroup: existing.ageGroup,
          beneficiariesMedical: existing.beneficiariesMedical,
          beneficiariesDental: existing.beneficiariesDental,
          beneficiariesTotal: existing.beneficiariesTotal,
        },
        record,
      );

      profiles.set(profileKey, {
        locationId: existing.locationId,
        period: existing.period,
        sex: existing.sex,
        ageGroup: existing.ageGroup,
        beneficiariesMedical: resolved.beneficiariesMedical,
        beneficiariesDental: resolved.beneficiariesDental,
        beneficiariesTotal: resolved.beneficiariesTotal,
      });
    }

    return profiles;
  }
  private aggregateMunicipalData(
    profiles: Map<
      string,
      {
        locationId: string;
        period: number;
        sex: string;
        ageGroup: string;
        beneficiariesMedical: number;
        beneficiariesDental: number;
        beneficiariesTotal: number;
      }
    >,
  ) {
    const municipalData = new Map<
      string,
      {
        locationId: string;
        period: number;
        beneficiariesMedical: number;
        beneficiariesDental: number;
        beneficiariesTotal: number;
      }
    >();

    for (const profile of profiles.values()) {
      const key = `${profile.locationId}|${profile.period}`;

      const existing = municipalData.get(key);

      if (!existing) {
        municipalData.set(key, {
          locationId: profile.locationId,
          period: profile.period,
          beneficiariesMedical: profile.beneficiariesMedical,
          beneficiariesDental: profile.beneficiariesDental,
          beneficiariesTotal: profile.beneficiariesTotal,
        });

        continue;
      }

      existing.beneficiariesMedical += profile.beneficiariesMedical;

      existing.beneficiariesDental += profile.beneficiariesDental;

      existing.beneficiariesTotal += profile.beneficiariesTotal;
    }

    return municipalData;
  }
  private buildProfileData(
    profiles: Map<
      string,
      {
        locationId: string;
        period: number;
        sex: string;
        ageGroup: string;
        beneficiariesMedical: number;
        beneficiariesDental: number;
        beneficiariesTotal: number;
      }
    >,
  ) {
    return Array.from(profiles.values()).map((profile) => ({
      locationId: profile.locationId,
      referencePeriod: profile.period,
      sex: profile.sex,
      ageGroup: profile.ageGroup,
      beneficiariesMedical: profile.beneficiariesMedical,
      beneficiariesDental: profile.beneficiariesDental,
      beneficiariesTotal: profile.beneficiariesTotal,
    }));
  }
  private buildMunicipalData(
    municipalData: Map<
      string,
      {
        locationId: string;
        period: number;
        beneficiariesMedical: number;
        beneficiariesDental: number;
        beneficiariesTotal: number;
      }
    >,
  ) {
    return Array.from(municipalData.values()).map((data) => ({
      locationId: data.locationId,
      referencePeriod: data.period,
      beneficiariesMedical: data.beneficiariesMedical,
      beneficiariesDental: data.beneficiariesDental,
      beneficiariesTotal: data.beneficiariesTotal,
    }));
  }
  private chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks;
  }
  private async persistCoverageData(
    profiles: Array<{
      locationId: string;
      referencePeriod: number;
      sex: string;
      ageGroup: string;
      beneficiariesMedical: number;
      beneficiariesDental: number;
      beneficiariesTotal: number;
    }>,
    municipalData: Array<{
      locationId: string;
      referencePeriod: number;
      beneficiariesMedical: number;
      beneficiariesDental: number;
      beneficiariesTotal: number;
    }>,
  ) {
    const periods = [
      ...new Set([
        ...profiles.map((profile) => profile.referencePeriod),
        ...municipalData.map((data) => data.referencePeriod),
      ]),
    ];

    if (periods.length === 0) {
      return;
    }

    await this.prisma.$transaction(
      async (transaction) => {
        await transaction.ansMunicipalProfile.deleteMany({
          where: {
            referencePeriod: {
              in: periods,
            },
          },
        });

        await transaction.ansMunicipalData.deleteMany({
          where: {
            referencePeriod: {
              in: periods,
            },
          },
        });

        const profileBatches = this.chunk(profiles, 1000);

        for (const batch of profileBatches) {
          await transaction.ansMunicipalProfile.createMany({
            data: batch,
          });
        }

        const municipalDataBatches = this.chunk(municipalData, 1000);

        for (const batch of municipalDataBatches) {
          await transaction.ansMunicipalData.createMany({
            data: batch,
          });
        }
      },
      {
        maxWait: 10_000,
        timeout: 120_000,
      },
    );
  }
  public async syncCoverageData() {
    const profiles = await this.processCoverageRecords();

    const municipalData = this.aggregateMunicipalData(profiles);

    const profileData = this.buildProfileData(profiles);

    const municipalDataRecords = this.buildMunicipalData(municipalData);

    await this.persistCoverageData(profileData, municipalDataRecords);
    this.logger.log(
      `Dados de cobertura da ANS sincronizados: ${profileData.length} perfis e ${municipalDataRecords.length} registros municipais.`,
    );

    return {
      profiles: profileData.length,
      municipalities: municipalDataRecords.length,
    };
  }
}
