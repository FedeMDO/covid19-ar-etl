import { Module } from '@nestjs/common';
import { DataTransformService } from './data-transform.service';

@Module({
  providers: [DataTransformService],
  exports: [DataTransformService],
})
export class DataTransformModule {}
