jest.mock('../database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../locations/locations.service', () => ({
  LocationsService: class LocationsService {},
}));

import { AnsMunicipalRecordDto } from './dto/ans-municipal-record.dto';
import { AnsService } from './ans.service';

describe('AnsService', () => {
  let service: AnsService;
  const prismaMock = {
    $transaction: jest.fn(),
  };

  const locationsMock = {
    getMunicipalitiesForAnsMapping: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AnsService(prismaMock as any, locationsMock as any);
  });

  describe('readRecords', () => {
    it('should parse CSV records correctly', async () => {
      const csv = [
        'PERIODO;CD_MUNICIPIO;NM_MUNICIPIO;CD_UF;SG_UF;SEXO;FAIXA_ETARIA;BENEF_ASSISTENCIA_MEDICA;BENEF_EXCLUS_ODONTOLOGICO;BENEF_TOTAL',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;1500;300;1800',
        '2026;250750;João Pessoa;25;PB;MASCULINO;30 a 39 anos;1200;250;1450',
      ].join('\n');

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      const records: AnsMunicipalRecordDto[] = [];

      for await (const record of service.readRecords(
        stream as Parameters<typeof service.readRecords>[0],
      )) {
        records.push(record);
      }

      expect(records).toHaveLength(2);

      expect(records[0]).toEqual({
        period: 2026,
        municipalityCode: '250750',
        municipalityName: 'João Pessoa',
        stateCode: '25',
        stateAbbreviation: 'PB',
        sex: 'FEMININO',
        ageGroup: '30 a 39 anos',
        beneficiariesMedical: 1500,
        beneficiariesDental: 300,
        beneficiariesTotal: 1800,
      });
    });

    it('should ignore records with invalid municipality codes', async () => {
      const csv = [
        'PERIODO;CD_MUNICIPIO;NM_MUNICIPIO;CD_UF;SG_UF;SEXO;FAIXA_ETARIA;BENEF_ASSISTENCIA_MEDICA;BENEF_EXCLUS_ODONTOLOGICO;BENEF_TOTAL',
        '2026;-1;Não identificado;-1;;FEMININO;30 a 39 anos;100;20;120',
      ].join('\n');

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      const records: AnsMunicipalRecordDto[] = [];

      for await (const record of service.readRecords(
        stream as Parameters<typeof service.readRecords>[0],
      )) {
        records.push(record);
      }

      expect(records).toHaveLength(0);
    });
  });

  describe('processCoverageRecords', () => {
    it('should process valid records and map them to IBGE locations', async () => {
      const csv = [
        'PERIODO;CD_MUNICIPIO;NM_MUNICIPIO;CD_UF;SG_UF;SEXO;FAIXA_ETARIA;BENEF_ASSISTENCIA_MEDICA;BENEF_EXCLUS_ODONTOLOGICO;BENEF_TOTAL',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;1500;300;1800',
      ].join('\n');

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      jest.spyOn(service, 'downloadCsv').mockResolvedValue(stream);

      locationsMock.getMunicipalitiesForAnsMapping.mockResolvedValue([
        {
          id: 'location-1',
          ibgeCode: '2507507',
          name: 'João Pessoa',
          parent: {
            ibgeCode: '25',
          },
        },
      ]);

      const profiles = await service['processCoverageRecords']();

      expect(profiles.size).toBe(1);

      expect([...profiles.values()][0]).toEqual({
        locationId: 'location-1',
        period: 2026,
        sex: 'FEMININO',
        ageGroup: '30 a 39 anos',
        beneficiariesMedical: 1500,
        beneficiariesDental: 300,
        beneficiariesTotal: 1800,
      });
    });

    it('should ignore records without an IBGE location match', async () => {
      const csv = [
        'PERIODO;CD_MUNICIPIO;NM_MUNICIPIO;CD_UF;SG_UF;SEXO;FAIXA_ETARIA;BENEF_ASSISTENCIA_MEDICA;BENEF_EXCLUS_ODONTOLOGICO;BENEF_TOTAL',
        '2026;999999;Município inválido;99;XX;FEMININO;30 a 39 anos;100;20;120',
      ].join('\n');

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      jest.spyOn(service, 'downloadCsv').mockResolvedValue(stream);

      locationsMock.getMunicipalitiesForAnsMapping.mockResolvedValue([
        {
          id: 'location-1',
          ibgeCode: '2507507',
          name: 'João Pessoa',
          parent: {
            ibgeCode: '25',
          },
        },
      ]);

      const profiles = await service['processCoverageRecords']();

      expect(profiles.size).toBe(0);
    });

    it('should keep the non-zero record when a duplicate has zero values', async () => {
      const csv = [
        'PERIODO;CD_MUNICIPIO;NM_MUNICIPIO;CD_UF;SG_UF;SEXO;FAIXA_ETARIA;BENEF_ASSISTENCIA_MEDICA;BENEF_EXCLUS_ODONTOLOGICO;BENEF_TOTAL',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;0;0;0',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;1500;300;1800',
      ].join('\n');

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      jest.spyOn(service, 'downloadCsv').mockResolvedValue(stream);

      locationsMock.getMunicipalitiesForAnsMapping.mockResolvedValue([
        {
          id: 'location-1',
          ibgeCode: '2507507',
          name: 'João Pessoa',
          parent: {
            ibgeCode: '25',
          },
        },
      ]);

      const profiles = await service['processCoverageRecords']();

      expect(profiles.size).toBe(1);

      expect([...profiles.values()][0]).toMatchObject({
        beneficiariesMedical: 1500,
        beneficiariesDental: 300,
        beneficiariesTotal: 1800,
      });
    });

    it('should keep a zero record when all duplicate records are zero', async () => {
      const csv = [
        'PERIODO;CD_MUNICIPIO;NM_MUNICIPIO;CD_UF;SG_UF;SEXO;FAIXA_ETARIA;BENEF_ASSISTENCIA_MEDICA;BENEF_EXCLUS_ODONTOLOGICO;BENEF_TOTAL',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;0;0;0',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;0;0;0',
      ].join('\n');

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      jest.spyOn(service, 'downloadCsv').mockResolvedValue(stream);

      locationsMock.getMunicipalitiesForAnsMapping.mockResolvedValue([
        {
          id: 'location-1',
          ibgeCode: '2507507',
          name: 'João Pessoa',
          parent: {
            ibgeCode: '25',
          },
        },
      ]);

      const profiles = await service['processCoverageRecords']();

      expect(profiles.size).toBe(1);

      expect([...profiles.values()][0]).toMatchObject({
        beneficiariesMedical: 0,
        beneficiariesDental: 0,
        beneficiariesTotal: 0,
      });
    });

    it('should keep one record when duplicate records are both non-zero', async () => {
      const csv = [
        'PERIODO;CD_MUNICIPIO;NM_MUNICIPIO;CD_UF;SG_UF;SEXO;FAIXA_ETARIA;BENEF_ASSISTENCIA_MEDICA;BENEF_EXCLUS_ODONTOLOGICO;BENEF_TOTAL',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;1500;300;1800',
        '2026;250750;João Pessoa;25;PB;FEMININO;30 a 39 anos;1600;350;1950',
      ].join('\n');

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      jest.spyOn(service, 'downloadCsv').mockResolvedValue(stream);

      locationsMock.getMunicipalitiesForAnsMapping.mockResolvedValue([
        {
          id: 'location-1',
          ibgeCode: '2507507',
          name: 'João Pessoa',
          parent: {
            ibgeCode: '25',
          },
        },
      ]);

      const profiles = await service['processCoverageRecords']();

      expect(profiles.size).toBe(1);

      expect([...profiles.values()][0]).toMatchObject({
        beneficiariesMedical: 1500,
        beneficiariesDental: 300,
        beneficiariesTotal: 1800,
      });
    });
  });

  describe('aggregateMunicipalData', () => {
    it('should aggregate beneficiary data by municipality and period', () => {
      const profiles = new Map([
        [
          'location-1|2026|FEMININO|20 a 29 anos',
          {
            locationId: 'location-1',
            period: 2026,
            sex: 'FEMININO',
            ageGroup: '20 a 29 anos',
            beneficiariesMedical: 100,
            beneficiariesDental: 20,
            beneficiariesTotal: 120,
          },
        ],
        [
          'location-1|2026|FEMININO|30 a 39 anos',
          {
            locationId: 'location-1',
            period: 2026,
            sex: 'FEMININO',
            ageGroup: '30 a 39 anos',
            beneficiariesMedical: 200,
            beneficiariesDental: 30,
            beneficiariesTotal: 230,
          },
        ],
        [
          'location-1|2026|MASCULINO|20 a 29 anos',
          {
            locationId: 'location-1',
            period: 2026,
            sex: 'MASCULINO',
            ageGroup: '20 a 29 anos',
            beneficiariesMedical: 150,
            beneficiariesDental: 15,
            beneficiariesTotal: 165,
          },
        ],
      ]);

      const result = (service as any).aggregateMunicipalData(profiles);

      expect(result.size).toBe(1);

      expect(result.get('location-1|2026')).toEqual({
        locationId: 'location-1',
        period: 2026,
        beneficiariesMedical: 450,
        beneficiariesDental: 65,
        beneficiariesTotal: 515,
      });
    });
  });

  describe('buildProfileData', () => {
    it('should transform profiles into Prisma-compatible data', () => {
      const profiles = new Map([
        [
          'location-1|2026|FEMININO|20 a 29 anos',
          {
            locationId: 'location-1',
            period: 2026,
            sex: 'FEMININO',
            ageGroup: '20 a 29 anos',
            beneficiariesMedical: 100,
            beneficiariesDental: 20,
            beneficiariesTotal: 120,
          },
        ],
      ]);

      const result = (service as any).buildProfileData(profiles);

      expect(result).toEqual([
        {
          locationId: 'location-1',
          referencePeriod: 2026,
          sex: 'FEMININO',
          ageGroup: '20 a 29 anos',
          beneficiariesMedical: 100,
          beneficiariesDental: 20,
          beneficiariesTotal: 120,
        },
      ]);
    });
  });

  describe('buildMunicipalData', () => {
    it('should transform municipal data into Prisma-compatible data', () => {
      const municipalData = new Map([
        [
          'location-1|2026',
          {
            locationId: 'location-1',
            period: 2026,
            beneficiariesMedical: 450,
            beneficiariesDental: 65,
            beneficiariesTotal: 515,
          },
        ],
      ]);

      const result = (service as any).buildMunicipalData(municipalData);

      expect(result).toEqual([
        {
          locationId: 'location-1',
          referencePeriod: 2026,
          beneficiariesMedical: 450,
          beneficiariesDental: 65,
          beneficiariesTotal: 515,
        },
      ]);
    });
  });

  describe('persistCoverageData', () => {
    it('should persist coverage data inside a transaction', async () => {
      const transactionMock = {
        ansMunicipalProfile: {
          deleteMany: jest.fn(),
          createMany: jest.fn(),
        },
        ansMunicipalData: {
          deleteMany: jest.fn(),
          createMany: jest.fn(),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) =>
        callback(transactionMock),
      );

      const profiles = [
        {
          locationId: 'location-1',
          referencePeriod: 2026,
          sex: 'FEMININO',
          ageGroup: '20 a 29 anos',
          beneficiariesMedical: 100,
          beneficiariesDental: 20,
          beneficiariesTotal: 120,
        },
      ];

      const municipalData = [
        {
          locationId: 'location-1',
          referencePeriod: 2026,
          beneficiariesMedical: 100,
          beneficiariesDental: 20,
          beneficiariesTotal: 120,
        },
      ];

      await (service as any).persistCoverageData(profiles, municipalData);

      expect(
        transactionMock.ansMunicipalProfile.deleteMany,
      ).toHaveBeenCalledWith({
        where: {
          referencePeriod: {
            in: [2026],
          },
        },
      });

      expect(transactionMock.ansMunicipalData.deleteMany).toHaveBeenCalledWith({
        where: {
          referencePeriod: {
            in: [2026],
          },
        },
      });

      expect(
        transactionMock.ansMunicipalProfile.createMany,
      ).toHaveBeenCalledWith({
        data: profiles,
      });

      expect(transactionMock.ansMunicipalData.createMany).toHaveBeenCalledWith({
        data: municipalData,
      });
    });
  });
  
  describe('syncCoverageData', () => {
    it('should process, aggregate, transform and persist coverage data', async () => {
      const profiles = new Map([
        [
          'location-1|2026|FEMININO|20 a 29 anos',
          {
            locationId: 'location-1',
            period: 2026,
            sex: 'FEMININO',
            ageGroup: '20 a 29 anos',
            beneficiariesMedical: 100,
            beneficiariesDental: 20,
            beneficiariesTotal: 120,
          },
        ],
      ]);

      const municipalData = new Map([
        [
          'location-1|2026',
          {
            locationId: 'location-1',
            period: 2026,
            beneficiariesMedical: 100,
            beneficiariesDental: 20,
            beneficiariesTotal: 120,
          },
        ],
      ]);

      const processSpy = jest
        .spyOn(service as any, 'processCoverageRecords')
        .mockResolvedValue(profiles);

      const aggregateSpy = jest
        .spyOn(service as any, 'aggregateMunicipalData')
        .mockReturnValue(municipalData);

      const buildProfileSpy = jest
        .spyOn(service as any, 'buildProfileData')
        .mockReturnValue([
          {
            locationId: 'location-1',
            referencePeriod: 2026,
            sex: 'FEMININO',
            ageGroup: '20 a 29 anos',
            beneficiariesMedical: 100,
            beneficiariesDental: 20,
            beneficiariesTotal: 120,
          },
        ]);

      const buildMunicipalSpy = jest
        .spyOn(service as any, 'buildMunicipalData')
        .mockReturnValue([
          {
            locationId: 'location-1',
            referencePeriod: 2026,
            beneficiariesMedical: 100,
            beneficiariesDental: 20,
            beneficiariesTotal: 120,
          },
        ]);

      const persistSpy = jest
        .spyOn(service as any, 'persistCoverageData')
        .mockResolvedValue(undefined);

      const result = await service.syncCoverageData();

      expect(processSpy).toHaveBeenCalledTimes(1);
      expect(aggregateSpy).toHaveBeenCalledWith(profiles);
      expect(buildProfileSpy).toHaveBeenCalledWith(profiles);
      expect(buildMunicipalSpy).toHaveBeenCalledWith(municipalData);

      expect(persistSpy).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        profiles: 1,
        municipalities: 1,
      });
    });
  });
});
