import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IbgeController } from './ibge.controller';
import { IbgeService } from './ibge.service';

@Module({
  imports: [HttpModule],
  controllers: [IbgeController],
  providers: [IbgeService],
  exports: [IbgeService],
})
export class IbgeModule {}