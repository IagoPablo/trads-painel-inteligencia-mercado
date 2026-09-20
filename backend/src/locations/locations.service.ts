import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { IbgeService } from '../ibge/ibge.service';
import { STATE_CODES } from '../common/constants/state-codes';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ibgeService: IbgeService,
  ) {}

  async countLocations() {
    return this.prisma.location.count();
  }

  async getMunicipalities(state?: string) {
  return this.prisma.location.findMany({
    where: {
      type: 'MUNICIPALITY',
      parent: state
        ? {
            ibgeCode: STATE_CODES[state.toUpperCase()],
          }
        : undefined,
    },
    select: {
      ibgeCode: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

  async findMunicipality(name: string) {
    return this.prisma.location.findFirst({
        where: {
        name: {
            equals: name,
            mode: 'insensitive',
        },
        type: 'MUNICIPALITY',
        },
        include: {
            parent: true,
        },
     });
    }

  async syncLocations() {
    const states = await this.ibgeService.getStates();

    for (const state of states) {
      await this.prisma.location.upsert({
        where: {
          ibgeCode: String(state.id),
        },
        update: {
          name: state.nome,
          type: 'STATE',
        },
        create: {
          ibgeCode: String(state.id),
          name: state.nome,
          type: 'STATE',
        },
      });
    }

    const savedStates = await this.prisma.location.findMany({
      where: {
        type: 'STATE',
      },
      select: {
        id: true,
        ibgeCode: true,
      },
    });

    const stateMap = new Map(
      savedStates.map((state) => [state.ibgeCode, state.id]),
    );

    let municipalitiesCount = 0;

    for (const state of states) {
      const parentId = stateMap.get(String(state.id));

      if (!parentId) {
        continue;
      }

      const municipalities =
        await this.ibgeService.getMunicipalitiesByState(state.sigla);

      for (const municipality of municipalities) {
        await this.prisma.location.upsert({
          where: {
            ibgeCode: String(municipality.id),
          },
          update: {
            name: municipality.nome,
            type: 'MUNICIPALITY',
            parentId,
          },
          create: {
            ibgeCode: String(municipality.id),
            name: municipality.nome,
            type: 'MUNICIPALITY',
            parentId,
          },
        });

        municipalitiesCount++;
      }
    }

    return {
      states: states.length,
      municipalities: municipalitiesCount,
    };
  }
    async findMunicipalityByAnsCode(
      ansCode: string,
      stateCode: string,
    ) {
      return this.prisma.location.findFirst({
        where: {
          type: 'MUNICIPALITY',
          ibgeCode: {
            startsWith: ansCode,
          },
          parent: {
            ibgeCode: stateCode,
            type: 'STATE',
          },
        },
        select: {
          id: true,
          ibgeCode: true,
          name: true,
          parentId: true,
        },
    });
  }
  
  async getMunicipalitiesForAnsMapping() {
    return this.prisma.location.findMany({
      where: {
        type: 'MUNICIPALITY',
      },
      select: {
        id: true,
        ibgeCode: true,
        name: true,
        parent: {
          select: {
            ibgeCode: true,
          },
        },
      },
    });
  }
}