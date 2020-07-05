export interface IGetCsvFileParams {
  url: string;
  ignored_columns?: string[];
  filters?: IDataFilter[];
}

export interface IDataFilter {
  column: string;
  filterValues: string[];
}
