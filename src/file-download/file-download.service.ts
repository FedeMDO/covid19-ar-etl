import { Injectable } from '@nestjs/common';
import * as papa from 'papaparse';

@Injectable()
export class FileDownloadService {
  async parseRemoteCsv(csvDataStr: string): Promise<papa.ParseResult<any>> {
    const parsed = papa.parse(csvDataStr);
    console.log(parsed.meta, parsed.errors);
    return parsed;
  }

  deleteColumns(csvArray: any[][], ignoredColumns: string[]) {
    const header = csvArray[0];
    const ignoredColumnsIdx = ignoredColumns
      .map(x => {
        return header.indexOf(x);
      })
      .filter(x => x !== -1);
    // reverse
    for (const ignored of ignoredColumnsIdx) {
      for (let i = csvArray.length; i--; ) {
        csvArray[i].splice(ignored, 1);
      }
    }
  }
}
