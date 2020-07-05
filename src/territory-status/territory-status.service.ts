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
    const createdCat = new this.territoryStatusModel(territoryStatusDTO);
    return createdCat.save();
  }

  async findAll(): Promise<TerritoryStatus[]> {
    return this.territoryStatusModel.find().exec();
  }
}
