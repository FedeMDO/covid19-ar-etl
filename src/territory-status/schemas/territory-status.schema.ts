import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TerritoryStatus extends Document {
  @Prop()
  TerritorioID: string;

  @Prop()
  TerritorioNombre: string;

  @Prop()
  TerritorioTipo: string;

  @Prop()
  Fecha: string;

  @Prop()
  Confirmados: {
    Nuevos: number;
    Total: number;
  };

  @Prop()
  Muertes: {
    Nuevos: number;
    Total: number;
  };
}

export const TerritoryStatusSchema = SchemaFactory.createForClass(
  TerritoryStatus,
);
