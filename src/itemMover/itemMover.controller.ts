import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ItemMoverService } from './itemMover.service';
import { User } from '../auth/user';
import { StealToken } from '../clanInventory/item/decorator/param/StealToken.decorator';
import { MoveItemDto } from '../clanInventory/item/dto/moveItem.dto';
import { StealItemsDto } from '../clanInventory/item/dto/stealItems.dto';
import { IdMismatchError } from '../clanInventory/item/errors/playerId.errors';
import { StealTokenGuard } from '../clanInventory/item/guards/StealToken.guard';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { StealToken as stealToken } from '../clanInventory/item/type/stealToken.type';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { ItemDto } from '../clanInventory/item/dto/item.dto';

@SwaggerTags('Item')
@Controller('item')
export class ItemMoverController {
  public constructor(private readonly itemMoverService: ItemMoverService) {}

  /**
   * Move item
   *
   * @remarks Move Item from Stock to Room or from Room to Stock, based on the moveTo field, which can have only two values: "Stock" or "Room"
   *
   * Notice that Clan members can move only own Clan Items and a member is trying to move other Clan's Item the 404 will be returned.
   *
   * Notice that if an Item need to be moved to a Stock then there is no need to specify the destination_id field, since Clan can have only one Stock.
   */
  @ApiResponseDescription({
    success: {
      dto: ItemDto,
      modelName: ModelName.ITEM,
      returnsArray: true,
    },
    errors: [400, 401, 404],
  })
  @Post('/move')
  @UniformResponse()
  public async moveItems(@Body() body: MoveItemDto, @LoggedUser() user: User) {
    const [_, errors] = await this.itemMoverService.moveItem(
      body.item_id,
      body.destination_id,
      body.moveTo,
      user.player_id,
    );
    if (errors) return errors;
  }

  /**
   * Steal items from another clan
   *
   * @remarks Steal Items from the loser Clan's SoulHome. The stolen Items will be automatically added to a specified Room of the winners Clan's SoulHome.
   *
   * Notice that at first a steal token should be obtained by the winner player(s) from the /gameData/battle POST endpoint with body type "result",
   * while informing about game result.
   *
   * Requests without the steal token or with an expired token will get 403 as a response.
   *
   * Notice that only found SoulHome Items will be stolen.
   * It is possible that some other player already has stoled some of the specified Items, in this case these Items will be ignored since they can not be stolen twice.
   *
   * You can see the process flow from [this diagram](https://github.com/Alt-Org/Altzone-Server/tree/dev/doc/img/game_results)
   */
  @ApiResponseDescription({
    success: {
      dto: ItemDto,
      modelName: ModelName.ITEM,
      returnsArray: true,
      description: 'Array of Items, which were stolen',
    },
    errors: [400, 401, 404],
  })
  @Post('steal')
  @UseGuards(StealTokenGuard)
  @UniformResponse(ModelName.ITEM)
  public async stealItems(
    @Body() body: StealItemsDto,
    @StealToken() stealToken: stealToken,
    @LoggedUser() user: User,
  ) {
    if (user.player_id !== stealToken.playerId) throw IdMismatchError;

    return await this.itemMoverService.stealItems(
      body.item_ids,
      stealToken,
      body.room_id,
    );
  }
}
