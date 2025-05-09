import {
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { _idDto } from '../common/dto/_id.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationFilter } from './FileValidation.filter';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { SecretHeader } from './decorator/SecretHeader.decorator';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { LogFileService } from './logFile.service';
import { BattleIdHeader } from './decorator/BattleIdHeader.decorator';
import { envVars } from '../common/service/envHandler/envVars';

@Controller('gameAnalytics')
export class GameAnalyticsController {
  public constructor(private readonly logFileService: LogFileService) {}

  @Post('/logFile')
  @UseFilters(new FileValidationFilter())
  @UseInterceptors(FileInterceptor('logFile'))
  @UniformResponse()
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @SecretHeader() secret: string,
    @LoggedUser() user: User,
    @BattleIdHeader() battleId?: string,
  ) {
    if (secret !== envVars.OWNCLOUD_LOG_FILES_SECRET)
      return [
        null,
        [
          new APIError({
            reason: APIErrorReason.NOT_AUTHORIZED,
            message: 'The "Secret" header is not valid',
          }),
        ],
      ];

    if (!file)
      return [
        null,
        [
          new APIError({
            reason: APIErrorReason.REQUIRED,
            message: 'Could not define a file sent. The file is required',
          }),
        ],
      ];

    const [, errors] = await this.logFileService.saveFile(
      file,
      user.player_id,
      battleId,
    );
    if (errors) return [null, errors];
  }
}
