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
import { TerritoryStatusService } from '../territory-status/territory-status.service';
import { DataTransformService } from '../data-transform/data-transform.service';
import {
  TerritorioTipo,
  ProvinciaCodigo,
} from 'src/data-transform/data-transform.consts';
import * as axios from 'axios';

@Controller('file-download')
export class FileDownloadController {
  constructor(
    private readonly fileDownloadService: FileDownloadService,
    private readonly territoryStatusService: TerritoryStatusService, // eliminar
    private readonly dataTransformService: DataTransformService,
  ) {}

  @Get()
  async testEscribirBd(): Promise<any> {
    // const res = await this.territoryStatusService.create({
    //   TerritorioID: '1',
    //   TerritorioNombre: 'Buenos Aires',
    //   TerritorioTipo: 'PROV',
    //   Fecha: '2020-05-07',
    //   Confirmados: {
    //     Nuevos: 10,
    //     Total: 1000,
    //   },
    //   Muertes: {
    //     Nuevos: 5,
    //     Total: 50,
    //   },
    // });
    const deleted = await this.territoryStatusService.deleteAll();
    return deleted;
  }

  @Post()
  async getCsvFile(@Body() params: IGetCsvFileParams): Promise<any> {
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
    const requestConfig = {
      url: params.url,
      responseEncoding: 'utf16le',
    };

    const res = await axios.default.request(requestConfig);

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
      res.data, // res.data,
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

    console.time('time PROCESSING');
    Logger.log(parsed.meta.fields, FileDownloadController.name);

    const provinciasData = [];

    const mapProvs = parsed.data.map(caso => {
      return {
        TerritorioID: ProvinciaCodigo[caso['carga_provincia_nombre']],
        TerritorioNombre: caso['carga_provincia_nombre'],
        TerritorioTipo: TerritorioTipo.Provincia,
      };
    });

    for (const provId of [...new Set(mapProvs.map(x => x.TerritorioID))]) {
      const found = mapProvs.find(x => x.TerritorioID === provId);
      provinciasData.push({
        territorio: found,
        casos: parsed.data.filter(
          caso => caso['carga_provincia_nombre'] === found.TerritorioNombre,
        ),
      });
    }

    const territoriosInfoReducida = [];

    // info provincias
    for (const provinciaData of provinciasData) {
      territoriosInfoReducida.push(
        ...this.dataTransformService.construirTerritorioStatus(
          provinciaData.casos,
          provinciaData.territorio.TerritorioID,
          provinciaData.territorio.TerritorioNombre,
          provinciaData.territorio.TerritorioTipo,
        ),
      );
    }

    // info pais
    territoriosInfoReducida.push(
      ...this.dataTransformService.construirTerritorioStatus(
        parsed.data,
        'ARG',
        'Argentina',
        TerritorioTipo.Pais,
      ),
    );

    console.timeEnd('time PROCESSING');
    Logger.log(
      `PROCEDING TO WRITE DB WITH ${territoriosInfoReducida.length} ENTRIES`,
      FileDownloadController.name,
    );

    // clean bd
    if (territoriosInfoReducida.length) {
      await this.territoryStatusService.deleteAll();
      // insert in b
      return this.territoryStatusService.createBulk(territoriosInfoReducida);
    }
    throw new Error('Error with data');
  }
}
