import { Injectable } from '@nestjs/common';
import * as papa from 'papaparse';
import { IDataFilter } from './file-download.interfaces';
import * as fs from 'fs';

@Injectable()
export class FileDownloadService {
  async parseCsvStringToArray(
    csvDataStr: string,
  ): Promise<papa.ParseResult<any>> {
    // const decoded: string = fs.readFileSync(
    //   `C:\\Users\\FedericoMontesdeOca\\Downloads\\Covid19Casos (2).csv`,
    //   { encoding: 'utf16le' },
    // );
    const parsed = papa.parse(csvDataStr, {
      encoding: 'utf16le',
      header: true,
      transformHeader: function(header) {
        return header
          .replace(/ /g, '')
          .replace(/"/g, '')
          .toLowerCase();
      },
    });

    return parsed;
  }

  deleteUselessRows(parsed: papa.ParseResult<any>): void {
    const { data, errors } = parsed;
    for (const error of errors) {
      data.splice(error.row, 1);
    }
  }

  deleteColumns(parsed: papa.ParseResult<any>, ignoredColumns: string[]): void {
    const { data, meta } = parsed;

    const validIgnoredColumns = ignoredColumns.filter(f =>
      meta.fields.includes(f),
    );
    if (!validIgnoredColumns.length) {
      return;
    }

    for (let i = data.length; i--; ) {
      for (let j = 0; j < ignoredColumns.length; j++) {
        const ignored = ignoredColumns[j];
        if (data[i][ignored]) {
          delete data[i][ignored];
        }
      }
    }

    const newFields = meta.fields.filter(f => !validIgnoredColumns.includes(f));
    meta.fields = newFields;
  }

  filterData(parsed: papa.ParseResult<any>, filters: IDataFilter[]): void {
    const { data, meta } = parsed;
    const validFilters = filters.filter(
      f => meta.fields.includes(f.column) && f.filterValues.length,
    );
    if (!validFilters.length) {
      return;
    }
    const result = [];

    for (let i = 0; i < data.length; i++) {
      const obj = data[i];
      let isValid = false;
      for (const filter of validFilters) {
        if (
          obj[filter.column] &&
          filter.filterValues.includes(obj[filter.column].toString())
        ) {
          isValid = true;
          break;
        }
      }
      if (isValid) {
        result.push(obj);
      }
    }
    parsed.data = result;
  }
}
