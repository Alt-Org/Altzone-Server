import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clan } from './clan.schema';
import Counter from '../common/service/counter/Counter';
import ICounterFactory from '../common/service/counter/ICounterFactory';

@Injectable()
/**
 * Counter for `playerCount` field in the Clan collection
 */
export class PlayerCounterFactory implements ICounterFactory {
  public constructor(@InjectModel('Clan') public readonly model: Model<Clan>) {}

  create() {
    return new Counter({ model: this.model, counterField: 'playerCount' });
  }
}
