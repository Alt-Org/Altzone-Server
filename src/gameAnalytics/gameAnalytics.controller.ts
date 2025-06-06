import {
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
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
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';

@Controller('gameAnalytics')
export class GameAnalyticsController {
  public constructor(private readonly logFileService: LogFileService) {}

  /**
   * Upload a game analytics log file
   *
   * @remarks Endpoint uploads a log file and save on the server.
   *
   * The file will be saved to the folder with name corresponding to the date when it was uploaded, i.e. 1-9-2024.
   *
   * File name must be unique and therefore its name will contain date, time, Player _id and a random string, i.e. 1-9-2024_14-45-12_667eedc9b3b5bf0f7a840ef1_123456.log
   *
   * Notice that the request must have a Secret header which holds a password for such requests.
   *
   * Notice that if the Battle-Id header is not defined the current timestamp will be used instead.
   *
   * Notice that the request must be in multipart/form-data format, where field name containing the file is "logFile"
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403],
  })
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
