import { Expose } from 'class-transformer';

export class GameMetadataDto {
  /**
   * Minimum version required for the game to function correctly
   *
   * @example "123"
   */
  @Expose()
  minBuildVersion: string;
}
