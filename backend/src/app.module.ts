import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { IbgeModule } from './ibge/ibge.module';
import { DatabaseModule } from './database/database.module';
import { LocationsModule } from './locations/locations.module';
import { MarketDataModule } from './market-data/market-data.module';
import { DataSyncModule } from './data-sync/data-sync.module';
import { AnsModule } from './ans/ans.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule, 
    IbgeModule, 
    LocationsModule,
    MarketDataModule,
    DataSyncModule,
    AnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
