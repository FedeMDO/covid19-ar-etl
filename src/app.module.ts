import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileDownloadModule } from './file-download/file-download.module';

@Module({
  imports: [FileDownloadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
