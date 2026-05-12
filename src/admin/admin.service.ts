import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clan } from '../clan/clan.schema';
import { Profile } from '../profile/profile.schema';
import { Player } from '../player/schemas/player.schema';
import { Stock } from '../clanInventory/stock/stock.schema';
import { Environment } from '../common/enum/environment.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Clan.name) private clanModel: Model<Clan>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    @InjectModel(Player.name) private playerModel: Model<Player>,
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
  ) {}

  async resetTeachingDemo(): Promise<void> {
    await this.clanModel.deleteMany({ environment: Environment.TEACHING_DEMO });

    await this.profileModel.deleteMany({
      environment: Environment.TEACHING_DEMO,
    });

    await this.playerModel.deleteMany({
      environment: Environment.TEACHING_DEMO,
    });

    await this.stockModel.deleteMany({
      environment: Environment.TEACHING_DEMO,
    });
  }
}
