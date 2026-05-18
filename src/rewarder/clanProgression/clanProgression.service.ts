import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clan } from '../../clan/clan.schema';
import { ClientSession, Model} from 'mongoose';
import { Player } from '../../player/schemas/player.schema';
import BasicService from '../../common/service/basicService/BasicService';
import { prizePool } from '../const/prizePool';
import { Stock } from '../../clanInventory/stock/stock.schema';
import { Item } from '../../clanInventory/item/item.schema';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { itemProperties } from '../../clanInventory/item/const/itemProperties';
import { ItemDto } from '../../clanInventory/item/dto/item.dto';

@Injectable()
export class ClanProgression {
  private readonly clanService: BasicService;
  private readonly playerService: BasicService;
  private readonly stockService: BasicService;
  private readonly itemService: BasicService;

  constructor(
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Stock.name) public readonly stockModel: Model<Stock>,
    @InjectModel(Item.name) public readonly itemModel: Model<Item>,
  ) {
    this.clanService = new BasicService(clanModel);
    this.playerService = new BasicService(playerModel);
    this.stockService = new BasicService(stockModel);
    this.itemService = new BasicService(itemModel);
  }

  /**
  * Handles prize pool progression
  * 
  * @param clan Clan to be updated
  * @param session Session for transactions
  */
  async handleClanProgression(
    clan: Clan,
    session?: ClientSession,
  ) {

    const pool = prizePool;
    const existingUnlocked = [...(clan.unlockedMilestones ?? [])];
    const newUnlockedPoints = [];
    const newItemRewards = [];
    let coins = clan.gameCoins;

    const newMilestones = pool.milestones.filter(milestone =>
      clan.points >= milestone.points &&
      !existingUnlocked.includes(milestone.points)
    );

    if (newMilestones.length === 0) return [null, null];

    for (const milestone of newMilestones) {
      existingUnlocked.push(milestone.points);
      newUnlockedPoints.push(milestone.points);
      newItemRewards.push(milestone.rewards.item);
      coins += milestone.rewards.coins;
    }

    const clanUpdateErrors = await this.handleClanUpdate(
      clan._id, 
      existingUnlocked, 
      coins, 
      session
    );
    if (clanUpdateErrors) return [null, clanUpdateErrors];

    const itemUpdateErrors = await this.handleItemUpdate(
      clan._id, 
      newItemRewards, 
      session
    );
    if (itemUpdateErrors) return [null, itemUpdateErrors];

    const playerUpdateErrors = await this.handlePlayerUpdate(
      clan._id, 
      newUnlockedPoints, 
      session
    );
    if (playerUpdateErrors) return [null, playerUpdateErrors];

    return [null, null];
  }

  /**
   * Add Unlocked Milestones and update Coins
   * @param clan_id Clan Id
   * @param existingUnlocked Milestones Clan has unlocked
   * @param coins Bonus Coins added to Clan
   * @param session Session for transactions
   * @returns If errors, Errors
   */
  private async handleClanUpdate(
    clan_id: string, 
    existingUnlocked: number[], 
    coins: number,
    session: ClientSession
  ) {
    const [, clanUpdateErrors] = await this.clanService.updateOneById(
      clan_id, 
      { 
        $set: { 
          unlockedMilestones: existingUnlocked,
          gameCoins: coins 
        }
      },
      { session }
    );
    if (clanUpdateErrors) return clanUpdateErrors;
  }

  /**
   * Add Claimable rewards to Players claimableRewards
   * @param clan_id Clan Id
   * @param newUnlockedPoints Rewards Players have unlocked
   * @param session Session for transactions
   * @returns If errors, Errors
   */
  private async handlePlayerUpdate(
    clan_id: string, 
    newUnlockedPoints: number[],
    session: ClientSession
  ) {
    const [players, playerErrors] = await this.playerService.readMany({
      filter: { clan_id },
      session
    });
    if (playerErrors) return playerErrors;

    const filter = { _id: { $in: players.map((player) => player._id) } };

    const [, playersUpdateErrors] = await this.playerService.updateMany(
      [
        { 
          $set: { claimableRewards: { 
            $concatArrays: [{ $ifNull: ['$claimableRewards', []] }, newUnlockedPoints] 
          } } 
        }
      ],
      { filter, session }
    );
    if (playersUpdateErrors) return playersUpdateErrors;
  }

  /**
   * Add Items from rewards to DB
   * @param clan_id Clan Id
   * @param newItemRewards Bonus furniture given to Clan when milestone achieved
   * @param session Session for transactions
   * @returns If errors, Errors
   */
  private async handleItemUpdate(
    clan_id: string, 
    newItemRewards: ItemDto[],
    session: ClientSession
  ) {
    const [stock, stockErrors] = await this.stockService.readOne({ 
      filter: { clan_id: clan_id },
      session
    });
    if (stockErrors) return stockErrors;

    const items = newItemRewards.map(reward => this.createItem(reward.name, stock._id))

    const [, itemErrors] = await this.itemService.createMany(
      items, 
      { session }
    );
    if (itemErrors) return itemErrors;
  }

  /**
   * Create item to be added to Clan's Stock
   * @param itemName Name of item to be created
   * @param stockId Stock Id used to track ownership
   * @returns Created item
   */
  private createItem(
    itemName: ItemName, 
    stockId: string
  ) {
    const item = itemProperties[itemName];
    return {
      ...item,
      location: [-1, -1],
      unityKey: item.name,
      stock_id: stockId,
      room_id: null,
    };
  }
}
