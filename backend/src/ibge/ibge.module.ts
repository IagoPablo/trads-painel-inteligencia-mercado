import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { IbgeService } from './ibge.service';

@Module({
  imports: [HttpModule],
  providers: [IbgeService],
  exports: [IbgeService],
})
export class IbgeModule {}