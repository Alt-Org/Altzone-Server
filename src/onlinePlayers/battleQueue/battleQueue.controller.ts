import { Controller, Get } from '@nestjs/common';
import { BattleQueueService } from './battleQueue.service';
import ApiResponseDescription from 'src/common/swagger/response/ApiResponseDescription';
import OnlinePlayerDto from '../dto/onlinePlayer.dto';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import SwaggerTags from '../../common/swagger/tags/SwaggerTags.decorator';

@Controller('/online-players/battleQueue')
export class BattleQueueController {
  constructor(private readonly service: BattleQueueService) {}

  @SwaggerTags('Release on 01.06.2025', 'OnlinePlayers')
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
    return [];
  }
}
