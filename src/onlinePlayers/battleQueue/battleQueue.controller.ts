import { Controller, Get } from '@nestjs/common';
import { BattleQueueService } from './battleQueue.service';
import OnlinePlayerDto from '../dto/onlinePlayer.dto';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { OnlinePlayersService } from '../onlinePlayers.service';
import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';

@Controller('/online-players/battleQueue')
export class BattleQueueController {
  constructor(
    private readonly service: BattleQueueService,
    private readonly onlinePlayersService: OnlinePlayersService,
  ) {}

  /**
   * Get battle queue
   *
   * @remarks Returns a list of online players waiting to join the battle in a queue order,
   * where the first player is the next to play
   */
  @ApiResponseDescription({
    success: {
      dto: OnlinePlayerDto,
      returnsArray: true,
      hasPagination: false,
    },
    errors: [401, 404],
  })
  @Get()
  @UniformResponse(null, OnlinePlayerDto)
  async getBattleQueue() {
    const queuePlayers = await this.onlinePlayersService.getOnlinePlayers({
      filter: { status: [OnlinePlayerStatus.BATTLE_WAIT] },
    });
    return this.service.sortPlayersByQueueNumber(queuePlayers);
  }
}
