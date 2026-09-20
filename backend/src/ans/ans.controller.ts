import {
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { AnsService } from './ans.service';

@Controller('ans')
export class AnsController {
  constructor(private readonly ansService: AnsService) {}

  @Post('sync')
  async sync() {
    return this.ansService.syncCoverageData();
  }

  @Get('municipalities/:ibgeCode')
  async getMunicipalityData(
    @Param('ibgeCode') ibgeCode: string,
  ) {
    return this.ansService.getMunicipalityData(ibgeCode);
  }
}