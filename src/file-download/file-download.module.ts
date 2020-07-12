import { Module, HttpModule } from '@nestjs/common';
import { FileDownloadService } from './file-download.service';
import { FileDownloadController } from './file-download.controller';
import { TerritoryStatusModule } from '../territory-status/territory-status.module';
import { DataTransformModule } from '../data-transform/data-transform.module';

@Module({
  providers: [FileDownloadService],
  imports: [TerritoryStatusModule, DataTransformModule],
  controllers: [FileDownloadController],
})
export class FileDownloadModule {}
