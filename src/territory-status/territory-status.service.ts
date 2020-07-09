import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TerritoryStatus } from './schemas/territory-status.schema';
import TerritoryStatusDTO from './territory-status.dto';

@Injectable()
export class TerritoryStatusService {
  constructor(
    @InjectModel(TerritoryStatus.name)
    private readonly territoryStatusModel: Model<TerritoryStatus>,
  ) {}

  async create(
    territoryStatusDTO: TerritoryStatusDTO,
  ): Promise<TerritoryStatus> {
    const created = new this.territoryStatusModel(territoryStatusDTO);
    return created.save();
  }

  async createBulk(territorioStatuses: Array<TerritoryStatusDTO>) {
    const writes = territorioStatuses.map(ts => {
      return { insertOne: { document: ts } };
    });
    return this.territoryStatusModel.bulkWrite(writes, { ordered: false });
  }

  async deleteAll(): Promise<any> {
    const res = this.territoryStatusModel.deleteMany({});
    return res;
  }

  async findAll(): Promise<TerritoryStatus[]> {
    return this.territoryStatusModel.find().exec();
  }
}
