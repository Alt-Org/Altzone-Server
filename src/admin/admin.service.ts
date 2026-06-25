import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminProfileDto } from './dto/AdminProfile.dto';
import { Clan } from '../clan/clan.schema';
import BasicService from '../common/service/basicService/BasicService';
import { Environment } from '../common/enum/environment.enum';
import { Game } from '../gameData/game.schema';
import { Player } from '../player/schemas/player.schema';
import { Profile } from '../profile/profile.schema';
import { SEReason } from '../common/service/basicService/SEReason';
import ServiceError from '../common/service/basicService/ServiceError';
import { SoulHome } from '../clanInventory/soulhome/soulhome.schema';
import { Stock } from '../clanInventory/stock/stock.schema';
import { CustomCharacter } from '../player/customCharacter/customCharacter.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Clan.name) private clanModel: Model<Clan>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    @InjectModel(Player.name) private playerModel: Model<Player>,
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
    @InjectModel(Game.name) private gameModel: Model<Game>,
    @InjectModel(SoulHome.name) private soulHomeModel: Model<SoulHome>,
    @InjectModel(CustomCharacter.name)
    private customCharacterModel: Model<CustomCharacter>,
  ) {
    this.profileService = new BasicService(profileModel);
  }

  public readonly profileService: BasicService;

  /**
   * Erases all data in the teaching demo environment.
   * @param profile_id - the ID of the profile requesting the reset (must be a system admin).
   * @returns - void if successful, or an array of ServiceErrors if there were issues (e.g. not authorized, unexpected error).
   */
  public async resetTeachingDemo(
    profile_id: string,
  ): Promise<void | [null, ServiceError[]]> {
    const [profile, profileErrors] =
      await this.profileService.readOneById<AdminProfileDto>(profile_id);

    if (profileErrors) {
      return [null, profileErrors];
    }

    if (!profile.isSystemAdmin) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            message:
              'Only system admins can manually erase teaching demo data.',
          }),
        ],
      ];
    }

    try {
      await this.clanModel.deleteMany({
        environment: Environment.TEACHING_DEMO,
      });

      await this.profileModel.deleteMany({
        environment: Environment.TEACHING_DEMO,
      });

      await this.playerModel.deleteMany({
        environment: Environment.TEACHING_DEMO,
      });

      await this.stockModel.deleteMany({
        environment: Environment.TEACHING_DEMO,
      });

      await this.gameModel.deleteMany({
        environment: Environment.TEACHING_DEMO,
      });

      await this.soulHomeModel.deleteMany({
        environment: Environment.TEACHING_DEMO,
      });

      await this.customCharacterModel.deleteMany({
        environment: Environment.TEACHING_DEMO,
      });
    } catch (error) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            message:
              'An error occurred while erasing teaching demo data: ' + error,
          }),
        ],
      ];
    }
  }
}
