import { Injectable } from '@nestjs/common';
import TerritoryStatusDTO from '../territory-status/territory-status.dto';
import { TerritorioTipo } from './data-transform.consts';

export class DataTransformService {
  construirTerritorioStatus(
    casos,
    TerritorioID,
    TerritorioNombre,
    TerritorioTipo,
  ): TerritoryStatusDTO[] {
    const parcialesConfirmados = new Array<Partial<TerritoryStatusDTO>>();
    const distintasFechasApertura = this.seleccionarDistintosValores(
      casos,
      'fecha_apertura',
    ).sort((a, b) => a - b);

    for (const fecha of distintasFechasApertura) {
      const casosDeLaFecha = casos.filter(c => c['fecha_apertura'] === fecha);
      const cantidadCasosTotalesHastaLaFecha = this.cantidadCasosTotalesHastaLaFecha(
        casos,
        fecha,
        'fecha_apertura',
      );

      const parcialTerritorioObject = {
        TerritorioID,
        TerritorioNombre,
        TerritorioTipo,
        Fecha: fecha,
        Confirmados: {
          Nuevos: casosDeLaFecha.length,
          Total: cantidadCasosTotalesHastaLaFecha,
        },
      } as Partial<TerritoryStatusDTO>;

      parcialesConfirmados.push(parcialTerritorioObject);
    }

    const parcialesMuertes = new Array<Partial<TerritoryStatusDTO>>();
    const distintasFechasFallecimiento = this.seleccionarDistintosValores(
      casos,
      'fecha_fallecimiento',
    ).sort((a, b) => a - b);

    for (const fecha of distintasFechasFallecimiento) {
      const casosDeLaFecha = casos.filter(
        c => c['fecha_fallecimiento'] === fecha,
      );
      const cantidadCasosTotalesHastaLaFecha = this.cantidadCasosTotalesHastaLaFecha(
        casos,
        fecha,
        'fecha_fallecimiento',
      );

      const parcialTerritorioObject = {
        TerritorioID,
        TerritorioNombre,
        TerritorioTipo,
        Fecha: fecha,
        Muertes: {
          Nuevos: casosDeLaFecha.length,
          Total: cantidadCasosTotalesHastaLaFecha,
        },
      } as Partial<TerritoryStatusDTO>;

      parcialesMuertes.push(parcialTerritorioObject);
    }
    return this.mergeCasosPorIdYFecha(parcialesConfirmados, parcialesMuertes);
  }

  mergeCasosPorIdYFecha(
    confirmados: Partial<TerritoryStatusDTO>[],
    muertes: Partial<TerritoryStatusDTO>[],
  ): any {
    let muertosTotal = 0;
    for (const c of confirmados) {
      const found = muertes.find(
        m =>
          m.Fecha === c.Fecha &&
          c.TerritorioID === m.TerritorioID &&
          c.TerritorioTipo === m.TerritorioTipo,
      );

      if (found) {
        Object.assign(c, found);
        muertosTotal += found.Muertes.Nuevos;
      } else {
        Object.assign(c, { Muertes: { Nuevos: 0, Total: muertosTotal } });
      }
    }
    return confirmados;
  }

  detectarUltimaFecha(objetos, columnaFechaTarget): string {
    const fechas = objetos.data.map(x => x[columnaFechaTarget] as string);
    const sorted = fechas.sort((a, b) => a - b);
    const result = sorted[sorted.length - 1];
    return result;
  }

  seleccionarDistintosValores(objetos, propiedad): any[] {
    const set = new Set();
    for (const obj of objetos) {
      if (typeof obj[propiedad] === 'string' && obj[propiedad].length > 0)
        set.add(obj[propiedad]);
    }
    return [...set];
  }

  cantidadCasosTotalesHastaLaFecha(
    casos,
    fechaTarget,
    columnaFechaTarget,
  ): number {
    const filtrado = casos.filter(
      c =>
        typeof c[columnaFechaTarget] === 'string' &&
        c[columnaFechaTarget].length > 0 &&
        c[columnaFechaTarget] <= fechaTarget,
    );
    return filtrado.length;
  }
}
