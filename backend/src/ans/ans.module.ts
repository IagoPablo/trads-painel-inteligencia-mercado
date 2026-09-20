import { Module } from '@nestjs/common';
import { AnsController } from './ans.controller';
import { AnsService } from './ans.service';
import { DatabaseModule } from '../database/database.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    DatabaseModule,
    LocationsModule,
  ],
  controllers: [AnsController],
  providers: [AnsService],
  exports: [AnsService],
})
export class AnsModule {}