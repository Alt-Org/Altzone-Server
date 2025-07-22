import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import BasicService from '../../common/service/basicService/BasicService';
import { InjectModel } from '@nestjs/mongoose';
import { Box } from '../schemas/box.schema';
import { Model } from 'mongoose';
import ClaimedAccount from './payloads/claimedAccount';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { TesterAccountService } from './testerAccount.service';
import { ClanDto } from '../../clan/dto/clan.dto';
import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';

@Injectable()
export default class AccountClaimerService {
  constructor(
    @InjectModel(Box.name) public readonly boxModel: Model<Box>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    private readonly testerService: TesterAccountService,
    private readonly jwtService: JwtService,
  ) {
    this.basicService = new BasicService(boxModel);
  }

  private readonly basicService: BasicService;

  /**
   * Claims an account based on the provided password:
   * - Creates a new profile and player
   * - Assign a player to one of the box clans
   * - Increases the amount of testers in the box
   *
   * @param password shared password for the claiming account in a box.
   *
   * @returns Claimed account data, as well as an access token, or ServiceErrors:
   * - REQUIRED - if the password is not provided
   * - NOT_FOUND - if there are no box with this password
   * - NOT_AUTHORIZED - if there are no places left (testersAmount < testersAccountsClaimed)
   */
  async claimAccount(
    password: string,
  ): Promise<IServiceReturn<ClaimedAccount>> {
    const [box, boxReadErrors] = await this.getBoxByPassword(password);
    if (boxReadErrors) return [null, boxReadErrors];

    const boxHasPlace = await this.boxModel.findOneAndUpdate(
      {
        _id: box._id,
        testerAccountsClaimed: { $lt: box.testersAmount },
      },
      { $inc: { testerAccountsClaimed: 1 } },
    );

    if (!boxHasPlace)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            field: 'testersAmount',
            value: box.testersAmount,
            message:
              'Box has no place for new testers anymore. Please, increase the allowed amount of testers to be able to claim new tester accounts',
          }),
        ],
      ];

    const [account, accountCreationErrors] =
      await this.testerService.createTester();
    if (accountCreationErrors) return [null, accountCreationErrors];

    const [accountClan, clanAssigningErrors] =
      await this.testerService.addTesterToClan(
        account.Player._id,
        box.createdClan_ids,
      );
    if (clanAssigningErrors) return [null, clanAssigningErrors];

    const accessToken = await this.jwtService.signAsync({
      player_id: account.Player._id.toString(),
      profile_id: account.Profile._id.toString(),
      box_id: box._id.toString(),
    });

    return [
      {
        ...account.Player,
        password: account.Profile.username,
        profile_id: account.Profile._id.toString(),
        accessToken,
        clan_id: accountClan._id.toString(),
        Clan: accountClan as ClanDto,
      },
      null,
    ];
  }

  /**
   * Retrieves the box based on the provided testers shared password.
   *
   * @param password - The shared testers password
   * @returns found box.
   */
  private async getBoxByPassword(
    password: string,
  ): Promise<IServiceReturn<Box>> {
    if (!password)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'password',
            value: password,
            message: 'Password param is required',
          }),
        ],
      ];

    return this.basicService.readOne<Box>({
      filter: { testersSharedPassword: password },
    });
  }
}
