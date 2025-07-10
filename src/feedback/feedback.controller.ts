import { Controller, Post } from '@nestjs/common';
import { _idDto } from '../common/dto/_id.dto';
import { PlayerService } from '../player/player.service';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly playerService: PlayerService) {}

  @NoAuth()
  @Post('add')
  async add() {
    return 'Working';
  }
}
