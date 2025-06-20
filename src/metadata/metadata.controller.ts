import { Controller, Get } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { GameMetadataDto } from './dto/gameMetadata.dto';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly service: MetadataService) {}

  /**
   * Get metadata about the game
   *
   * @remarks This endpoint provides the minimum version required for the game client to function correctly.
   */
  @ApiResponseDescription({
    success: {
      dto: GameMetadataDto,
    },
  })
  @SwaggerTags('Release on 29.06.2025', 'Metadata')
  @NoAuth()
  @UniformResponse()
  @Get('game')
  async getVersion() {
    const [minBuildVersion, error] =
      await this.service.getGameMinBuildVersion();

    if (error) return [null, error];

    return [{ minBuildVersion } as GameMetadataDto, null];
  }
}
