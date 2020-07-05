import { Module } from '@nestjs/common';
import { TerritoryStatusService } from './territory-status.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TerritoryStatus,
  TerritoryStatusSchema,
} from './schemas/territory-status.schema';

@Module({
  providers: [TerritoryStatusService],
  imports: [
    MongooseModule.forFeature([
      { name: TerritoryStatus.name, schema: TerritoryStatusSchema },
    ]),
  ],
  exports: [TerritoryStatusService],
})
export class TerritoryStatusModule {}
