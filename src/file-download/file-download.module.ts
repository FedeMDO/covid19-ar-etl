import { Module, HttpModule } from '@nestjs/common';
import { FileDownloadService } from './file-download.service';
import { FileDownloadController } from './file-download.controller';

@Module({
  providers: [FileDownloadService],
  imports: [HttpModule],
  controllers: [FileDownloadController],
})
export class FileDownloadModule {}
