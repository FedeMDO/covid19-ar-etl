import {
  Controller,
  HttpService,
  Body,
  BadRequestException,
  Post,
  Logger,
  Get,
} from '@nestjs/common';
import { FileDownloadService } from './file-download.service';
import { IGetCsvFileParams } from './file-download.interfaces';
import { TerritoryStatusService } from 'src/territory-status/territory-status.service';

@Controller('file-download')
export class FileDownloadController {
  constructor(
    private readonly fileDownloadService: FileDownloadService,
    private readonly territoryStatusService: TerritoryStatusService,
    private httpClient: HttpService,
  ) {}

  @Get()
  async testEscribirBd(): Promise<any> {
    const res = await this.territoryStatusService.create({
      TerritorioID: '1',
      TerritorioNombre: 'Buenos Aires',
      TerritorioTipo: 'PROV',
      Fecha: '2020-05-07',
      Confirmados: {
        Nuevos: 10,
        Total: 1000,
      },
      Muertes: {
        Nuevos: 5,
        Total: 50,
      },
    });
    return res;
  }

  @Post()
  async getCsvFile(@Body() params: IGetCsvFileParams): Promise<void> {
    // test input
    if (!params.url && typeof params.url !== 'string') {
      throw new BadRequestException();
    }

    // query endpoint
    Logger.log(
      `starting download at ${params.url}`,
      FileDownloadController.name,
    );
    console.time('time to download');
    const res = await this.httpClient.get(params.url).toPromise();
    console.timeEnd('time to download');
    if (res.data && res.data.length) {
      Logger.log(
        `downloaded data size in KB: ${Math.ceil(res.data.length / 1024)}`,
        FileDownloadController.name,
      );
    }

    if (typeof res.data !== 'string') {
      throw new Error('bad remote csv. check url');
    }
    console.time('time preprocessing');
    const parsed = await this.fileDownloadService.parseCsvStringToArray(
      res.data,
    );
    // Logger.log(parsed.meta, FileDownloadController.name);
    Logger.log(
      `Found ${parsed.errors.length} errors while parsing to objects`,
      FileDownloadController.name,
    );
    this.fileDownloadService.deleteUselessRows(parsed);

    // clean
    if (params.ignored_columns && params.ignored_columns.length) {
      Logger.log(
        `quantity of columns before column deleting ${
          Object.keys(parsed.data[0]).length
        }`,
        FileDownloadController.name,
      );
      this.fileDownloadService.deleteColumns(parsed, params.ignored_columns);
      Logger.log(
        `quantity of columns after column deleting ${
          Object.keys(parsed.data[0]).length
        }`,
        FileDownloadController.name,
      );
    }

    // filter
    if (params.filters && params.filters.length) {
      Logger.log(
        `quantity of objects before filter ${parsed.data.length}`,
        FileDownloadController.name,
      );
      this.fileDownloadService.filterData(parsed, params.filters);
      Logger.log(
        `quantity of objects after filter ${parsed.data.length}`,
        FileDownloadController.name,
      );
    }
    console.timeEnd('time preprocessing');
    // Logger.log(parsed.meta.fields, FileDownloadController.name);
  }
}
