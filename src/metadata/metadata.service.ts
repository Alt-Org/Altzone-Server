import { Injectable } from '@nestjs/common';
import ServiceError from '../common/service/basicService/ServiceError';
import { IServiceReturn } from '../common/service/basicService/IService';
import { SEReason } from '../common/service/basicService/SEReason';
import { envVars } from '../common/service/envHandler/envVars';

@Injectable()
export class MetadataService {
  constructor() {}

  /**
   * Lookup the MINIMUM_VERSION parameter from config file.
   *
   * @returns - Returns a promise that contains the expected version number or an API error.
   */
  async getGameMinBuildVersion(): Promise<IServiceReturn<string>> {
    if (
      envVars.MIN_GAME_BUILD_VERSION.length === 0 ||
      envVars.MIN_GAME_BUILD_VERSION === '0'
    ) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.MISCONFIGURED,
            message:
              'MIN_GAME_BUILD_VERSION is not set in the environment variables.',
          }),
        ],
      ];
    }
    return [envVars.MIN_GAME_BUILD_VERSION, null];
  }
}
