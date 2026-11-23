import { Expose, Type } from 'class-transformer';
import { ClanLogoDto } from '../../clan/dto/clanLogo.dto';

export class GlobalClanLeaderboardEntryDto {
  /** One-based rank in the complete production clan population. */
  @Expose()
  rank: number;

  /** Accepted wins attributed to the clan when they were earned. */
  @Expose()
  wins: number;

  @Expose()
  clanId: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ClanLogoDto)
  logo: ClanLogoDto | null;
}

export class GlobalClanLeaderboardDto {
  @Expose()
  @Type(() => GlobalClanLeaderboardEntryDto)
  entries: GlobalClanLeaderboardEntryDto[];

  /** Authenticated player's current production clan rank, otherwise null. */
  @Expose()
  ownRank: number | null;
}

export class GlobalClanLeaderboardResponseDataDto {
  @Expose()
  @Type(() => GlobalClanLeaderboardDto)
  leaderboard: GlobalClanLeaderboardDto;
}

export class GlobalClanLeaderboardMetaDataDto {
  @Expose()
  dataKey: 'leaderboard';

  @Expose()
  modelName: 'Leaderboard';

  @Expose()
  dataType: 'Object';

  @Expose()
  dataCount: 1;
}

export class GlobalClanLeaderboardPaginationDto {
  /** One-based page requested by the client. */
  @Expose()
  currentPage: number;

  /** Maximum number of entries on the page, from 1 to 50. */
  @Expose()
  limit: number;

  @Expose()
  offset: number;

  /** Total entries in the production clan leaderboard. */
  @Expose()
  itemCount: number;

  @Expose()
  pageCount: number;
}

export class GlobalClanLeaderboardResponseDto {
  @Expose()
  @Type(() => GlobalClanLeaderboardResponseDataDto)
  data: GlobalClanLeaderboardResponseDataDto;

  @Expose()
  @Type(() => GlobalClanLeaderboardMetaDataDto)
  metaData: GlobalClanLeaderboardMetaDataDto;

  @Expose()
  @Type(() => GlobalClanLeaderboardPaginationDto)
  paginationData: GlobalClanLeaderboardPaginationDto;
}
