import {
  Controller,
  Get,
  HttpService,
  Body,
  BadRequestException,
  Post,
} from '@nestjs/common';
import { FileDownloadService } from './file-download.service';
import { IGetCsvFileParams } from './file-download.interfaces';

@Controller('file-download')
export class FileDownloadController {
  constructor(
    private readonly fileDownloadService: FileDownloadService,
    private httpClient: HttpService,
  ) {}
  @Post()
  async getCsvFile(@Body() params: IGetCsvFileParams): Promise<void> {
    // test input
    if (!params.url && typeof params.url !== 'string') {
      throw new BadRequestException();
    }

    // query endpoint
    const res = await this.httpClient.get(params.url).toPromise();

    if (typeof res.data !== 'string') {
      throw new Error('bad remote csv. check url');
    }

    const parsed = await this.fileDownloadService.parseRemoteCsv(res.data);

    const { data } = parsed;

    if (params.ignored_columns && params.ignored_columns.length) {
      this.fileDownloadService.deleteColumns(data, params.ignored_columns);
    }
  }
}
