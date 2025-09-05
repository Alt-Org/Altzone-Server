import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FleaMarketService } from './fleaMarket.service';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { _idDto } from '../common/dto/_id.dto';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { FleaMarketItemDto } from './dto/fleaMarketItem.dto';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { PlayerService } from '../player/player.service';
import { SellFleaMarketItemDto } from './dto/sellFleaMarketItem.dto';
import HasClanRights from '../clan/role/decorator/guard/HasClanRights';
import { ClanBasicRight } from '../clan/role/enum/clanBasicRight.enum';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { ItemIdDto } from './dto/itemId.dto';
import { VotingDto } from '../voting/dto/voting.dto';
import { ChangeItemStatusDto } from './dto/changeItemStatus.dto';
import { Status } from './enum/status.enum';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';

@Controller('fleaMarket')
export class FleaMarketController {
  constructor(
    private readonly service: FleaMarketService,
    private readonly playerService: PlayerService,
  ) {}

  /**
   * Get flea market item by _id.
   *
   * @remarks Get an individual FleaMarketItem by its mongo _id field.
   */
  @ApiResponseDescription({
    success: {
      dto: FleaMarketItemDto,
      modelName: ModelName.FLEA_MARKET_ITEM,
    },
    errors: [400, 401, 404],
  })
  @Get('/:_id')
  @UniformResponse(ModelName.FLEA_MARKET_ITEM, FleaMarketItemDto)
  async getOne(@Param() param: _idDto) {
    return await this.service.readOneById(param._id);
  }

  /**
   * Get all flea market items
   *
   * @remarks Get all FleaMarketItems of the flea market
   */
  @ApiResponseDescription({
    success: {
      dto: FleaMarketItemDto,
      modelName: ModelName.FLEA_MARKET_ITEM,
      returnsArray: true,
    },
    errors: [400, 401, 404],
  })
  @Get()
  @OffsetPaginate(ModelName.FLEA_MARKET_ITEM)
  @UniformResponse(ModelName.FLEA_MARKET_ITEM, FleaMarketItemDto)
  async getAll(@GetAllQuery() query: IGetAllQuery) {
    return await this.service.readMany(query);
  }

  /**
   * Sell a clan item on flea market
   *
   * @remarks Sell an Item on the flea market.
   * This will start a voting in the Clan from which Item is being moved to the flea marked.
   * Voting min approval percentage is 51. During the voting an Item is in "Shipping" status and can not be bought by other players.
   *
   * Notice that the player must be in the same clan, and it must have a basic right "Shop".
   *
   * Notice that if a FleaMarketItem has already "Shipping" status 403 will be returned.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @Post('sell')
  @HasClanRights([ClanBasicRight.SHOP])
  @UniformResponse()
  async sell(
    @Body() sellFleaMarketItemDto: SellFleaMarketItemDto,
    @LoggedUser() user: User,
  ) {
    const clanId = await this.service.getClanId(
      sellFleaMarketItemDto.item_id,
      user.player_id,
    );

    if (!clanId)
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'The item does not belong to the clan of logged in player',
      });

    await this.service.handleSellItem(
      sellFleaMarketItemDto,
      clanId,
      user.player_id,
    );
  }

  /**
   * Buy an item on flea market for your clan
   *
   * @remarks Buy an Item from the flea market.
   * This will start a voting in the Clan for which Item is being purchased.
   * Voting duration is 10 min at max and the min approval percentage is 51.
   * During the voting an Item is in "Booked" status and can not be bought by other players.
   *
   * Notice that the player must be in the same clan and it must have a basic right "Shop".
   *
   * Notice that if a FleaMarketItem has already "Booked" status 403 will be returned.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @Post('buy')
  @HasClanRights([ClanBasicRight.SHOP])
  @UniformResponse()
  async buy(@Body() itemIdDto: ItemIdDto, @LoggedUser() user: User) {
    await this.playerService.readOneById(user.player_id);

    const clanId = await this.playerService.getPlayerClanId(user.player_id);
    if (!clanId)
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'Player must be a member of a clan to buy items',
      });

    await this.service.handleBuyItem(clanId, itemIdDto.item_id, user.player_id);
  }

  /**
   * Start voting to change flea market item price.
   *
   * @remarks Change flea market item price.
   * This will start a voting in the Clan to change a price of flea market item belonging to your clan.
   * Voting duration is 10min and the min approval percentage is 51.
   * During the voting an Item is in "Shipping" status and can not be bought by other players.
   */
  @ApiResponseDescription({
    success: {
      status: 200,
    },
    errors: [400, 404],
  })
  @Post('change-item-price')
  @HasClanRights([ClanBasicRight.SHOP])
  @UniformResponse(ModelName.VOTING, VotingDto)
  async changePrice(
    @Body() body: SellFleaMarketItemDto,
    @LoggedUser() user: User,
  ) {
    return this.service.changeItemPrice(
      body.item_id,
      body.price,
      user.player_id,
    );
  }

  /**
   * Change the status of a flea market item.
   *
   * @remarks Changes the status of a flea market item belonging to the players clan.
   * Player will need a SHOP clan right.
   * The status can only be changed between available and shipping.
   * If the item is booked it's status can't be changed.
   */
  @SwaggerTags('Release on 07.09.2025')
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 403, 404],
  })
  @HasClanRights([ClanBasicRight.SHOP])
  @Post('change-item-status')
  @UniformResponse()
  async changeItemStatus(
    @Body() body: ChangeItemStatusDto,
    @LoggedUser() user: User,
  ) {
    const [item, itemError] = await this.service.readOneById(body.item_id);
    if (itemError) throw itemError;
    if (item.status === Status.BOOKED)
      throw new APIError({
        reason: APIErrorReason.NOT_ALLOWED,
        message: `The item is booked so it's status can't be currently changed.`,
      });

    const clanId = await this.service.getFleaMarketItemClanId(
      body.item_id,
      user.player_id,
    );
    if (!clanId)
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'The item does not belong to the clan of logged in player',
      });

    if (body.status === Status.AVAILABLE) {
      const [_, errors] = await this.service.checkClanItemSlots(clanId);
      if (errors) throw errors;
    }

    const [_, updateError] = await this.service.basicService.updateOneById(
      body.item_id,
      {
        status: body.status,
      },
    );

    if (updateError) throw updateError;
  }

  /**
   * Move item from fleamarket to stock.
   *
   * @remarks Moves the item from fleamarket to stock.
   * Player will need a SHOP clan right.
   * Item can't be moved if it's booked.
   * Item must belong to the players clan.
   */
  @SwaggerTags('Release on 07.09.2025')
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 403, 404],
  })
  @HasClanRights([ClanBasicRight.SHOP])
  @UniformResponse()
  @Post('move-to-stock/:_id')
  async removeItemFromFleaMarket(
    @Param() param: _idDto,
    @LoggedUser() user: User,
  ) {
    const clanId = await this.service.getFleaMarketItemClanId(
      param._id,
      user.player_id,
    );
    if (!clanId)
      throw new APIError({
        reason: APIErrorReason.NOT_AUTHORIZED,
        message: 'The item does not belong to the clan of logged in player',
      });

    const [_, errors] = await this.service.moveFleaMarketItemToStock(
      param._id,
      clanId,
    );
    if (errors) return [null, errors];
  }
}
