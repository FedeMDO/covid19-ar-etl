export default class TerritoryStatusDTO {
  TerritorioID: string;
  TerritorioNombre: string;
  TerritorioTipo: string;
  Fecha: string;
  Confirmados: {
    Nuevos: number;
    Total: number;
  };
  Muertes: {
    Nuevos: number;
    Total: number;
  };
}
