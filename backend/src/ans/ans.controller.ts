import { Controller, Post } from '@nestjs/common';

import { AnsService } from './ans.service';

@Controller('ans')
export class AnsController {
  constructor(private readonly ansService: AnsService) {}

  @Post('sync')
  async sync() {
    return this.ansService.syncCoverageData();
  }
}