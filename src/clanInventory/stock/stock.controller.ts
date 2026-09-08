import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockService } from './stock.service';
import { StockDto } from './dto/stock.dto';
import { ItemDto } from '../item/dto/item.dto';
import { User } from '../../auth/user';
import { Player } from '../../player/schemas/player.schema';
import { Authorize } from '../../authorization/decorator/Authorize';
import { Action } from '../../authorization/enum/action.enum';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { GetAllQuery } from '../../common/decorator/param/GetAllQuery';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { _idDto } from '../../common/dto/_id.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { AddSearchQuery } from '../../common/interceptor/request/addSearchQuery.interceptor';
import { AddSortQuery } from '../../common/interceptor/request/addSortQuery.interceptor';
import { OffsetPaginate } from '../../common/interceptor/request/offsetPagination.interceptor';
import { IGetAllQuery } from '../../common/interface/IGetAllQuery';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import { Environment } from '../../common/enum/environment.enum';

@Controller('stock')
export class StockController {
  public constructor(
    private readonly service: StockService,
    @InjectModel(ModelName.PLAYER) private readonly playerModel: Model<Player>,
  ) {}

  /**
   * Get logged-in Player's Clan stock items by Stock _id
   *
   * @remarks Returns the list of Items currently stored in the logged-in Player's Clan Stock with the given _id.
   */
  @ApiResponseDescription({
    success: {
      dto: ItemDto,
      modelName: ModelName.ITEM,
      returnsArray: true,
    },
    errors: [400, 401, 403, 404],
  })
  @Get('/:_id')
  @Authorize({ action: Action.read, subject: StockDto })
  @UniformResponse(ModelName.ITEM)
  public async get(@Param() param: _idDto, @LoggedUser() user: User) {
    const [stockClan_id, errors] = await this.service.getStockClanId(param._id);
    if (errors || !stockClan_id) return [null, errors];

    const playerClan = await this.playerModel.findById(user.player_id);

    if (playerClan.clan_id.toString() !== stockClan_id)
      return [
        null,
        [
          new APIError({
            reason: APIErrorReason.NOT_AUTHORIZED,
            field: '_id',
            value: param._id,
            message: "Cannot view another Clan's Stock",
          }),
        ],
      ];

    return this.service.readItemsByStockId(param._id);
  }

  /**
   * Get logged-in player's Clan stocks
   *
   * @remarks Read all created Stocks of the Clan the logged-in Player belongs to.
   */
  @ApiResponseDescription({
    success: {
      dto: StockDto,
      modelName: ModelName.STOCK,
      returnsArray: true,
    },
    errors: [401, 404],
  })
  @Get()
  @Authorize({ action: Action.read, subject: StockDto })
  @OffsetPaginate(ModelName.STOCK)
  @AddSearchQuery(StockDto)
  @AddSortQuery(StockDto)
  @UniformResponse(ModelName.STOCK)
  public getAll(
    @GetAllQuery() query: IGetAllQuery,
    @LoggedUser() user: User,
    @Query('environment', new ParseIntPipe({ optional: true }))
    environment?: Environment,
  ) {
    return this.service.readPlayerClanStocks(
      user.player_id,
      query,
      environment,
    );
  }
}
