import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import DetermineClanId from '../common/guard/clanId.guard';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { JukeboxService } from './jukebox.service';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';
import { AddSongDto } from './dto/AddSong.dto';
import { ModelName } from '../common/enum/modelName.enum';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import { _idDto } from '../common/dto/_id.dto';
import { SongDto } from './dto/songQueue.dto';

@Controller('jukebox')
export class JukeboxController {
  constructor(
    private readonly service: JukeboxService,
    private readonly emitterService: EventEmitterService,
  ) {}

  /**
   * Get song queue.
   *
   * @remarks Get jukebox song queue of the player's clan.
   */
  @ApiResponseDescription({
    success: {
      status: 200,
      isArray: true,
      dataKey: 'jukeboxSongs',
    },
    errors: [400, 403, 404],
    hasAuth: true,
  })
  @Get()
  @DetermineClanId()
  @UniformResponse('SongQueue' as ModelName, SongDto)
  async getClanSongQueue(@LoggedUser() user: User) {
    return this.service.getClanSongQueue(user.clan_id);
  }

  /**
   * Add song.
   *
   * @remarks Adds a song to the end of the player's clan's jukebox song queue.
   */
  @ApiResponseDescription({
    success: {
      status: 201,
    },
    errors: [400, 403, 404],
  })
  @Post()
  @DetermineClanId()
  @UniformResponse()
  async addSongToClanPlaylist(
    @Body() body: AddSongDto,
    @LoggedUser() user: User,
  ) {
    await this.service.addSongToClanPlaylist(
      user.clan_id,
      user.player_id,
      body,
    );

    this.emitterService.EmitNewDailyTaskEvent(
      user.player_id,
      ServerTaskName.CREATE_CLAN_PLAYLIST,
    );
  }

  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400],
  })
  @Delete('/:_id')
  @DetermineClanId()
  @UniformResponse()
  removeSongFromQueue(@Param() param: _idDto, @LoggedUser() user: User) {
    this.service.removeSongFromQueue(user.clan_id, user.player_id, param._id);
  }
}
