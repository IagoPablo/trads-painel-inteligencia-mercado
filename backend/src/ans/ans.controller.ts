import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { AnsService } from './ans.service';
import { SyncApiKeyGuard } from '../common/guards/sync-api-key.guard';

@Controller('ans')
export class AnsController {
  constructor(private readonly ansService: AnsService) {}

  @Post('sync')
  @UseGuards(SyncApiKeyGuard)
  async sync() {
    return this.ansService.syncCoverageData();
  }

  @Get('municipalities/:ibgeCode')
  async getMunicipalityData(@Param('ibgeCode') ibgeCode: string) {
    return this.ansService.getMunicipalityData(ibgeCode);
  }
}
