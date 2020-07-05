import { Module, HttpModule } from '@nestjs/common';
import { FileDownloadService } from './file-download.service';
import { FileDownloadController } from './file-download.controller';
import { TerritoryStatusModule } from '../territory-status/territory-status.module';

@Module({
  providers: [FileDownloadService],
  imports: [HttpModule, TerritoryStatusModule],
  controllers: [FileDownloadController],
})
export class FileDownloadModule {}
