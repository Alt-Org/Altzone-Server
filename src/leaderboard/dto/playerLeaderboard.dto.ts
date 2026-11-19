import { Expose, Type } from 'class-transformer';
import { ClanLogoDto } from '../../clan/dto/clanLogo.dto';
import { AvatarDto } from '../../player/dto/avatar.dto';

export class PlayerLeaderboardClanDto {
  @Expose()
  clanId: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ClanLogoDto)
  logo: ClanLogoDto;
}

export class PlayerLeaderboardEntryDto {
  /** One-based rank in the complete filtered population, before pagination. */
  @Expose()
  rank: number;

  /** Accepted lifetime human 1v1 wins. */
  @Expose()
  wins: number;

  @Expose()
  playerId: string;

  @Expose()
  nickname: string;

  @Expose()
  @Type(() => AvatarDto)
  avatar: AvatarDto | null;

  @Expose()
  @Type(() => PlayerLeaderboardClanDto)
  clan: PlayerLeaderboardClanDto | null;
}

export class PlayerLeaderboardDto {
  @Expose()
  @Type(() => PlayerLeaderboardEntryDto)
  entries: PlayerLeaderboardEntryDto[];

  /**
   * Authenticated player's rank in this view. Null for anonymous, ineligible,
   * or public clan-player requests.
   */
  @Expose()
  ownRank: number | null;
}

export class PlayerLeaderboardResponseDataDto {
  @Expose()
  @Type(() => PlayerLeaderboardDto)
  leaderboard: PlayerLeaderboardDto;
}

export class PlayerLeaderboardMetaDataDto {
  @Expose()
  dataKey: 'leaderboard';

  @Expose()
  modelName: 'Leaderboard';

  @Expose()
  dataType: 'Object';

  @Expose()
  dataCount: 1;
}

export class PlayerLeaderboardPaginationDto {
  /** One-based page requested by the client. */
  @Expose()
  currentPage: number;

  /** Maximum number of entries on the page, from 1 to 50. */
  @Expose()
  limit: number;

  @Expose()
  offset: number;

  /** Total entries in the complete filtered leaderboard population. */
  @Expose()
  itemCount: number;

  @Expose()
  pageCount: number;
}

export class PlayerLeaderboardResponseDto {
  @Expose()
  @Type(() => PlayerLeaderboardResponseDataDto)
  data: PlayerLeaderboardResponseDataDto;

  @Expose()
  @Type(() => PlayerLeaderboardMetaDataDto)
  metaData: PlayerLeaderboardMetaDataDto;

  @Expose()
  @Type(() => PlayerLeaderboardPaginationDto)
  paginationData: PlayerLeaderboardPaginationDto;
}
