import { Expose, Type } from 'class-transformer';
import { ClanLogoDto } from '../../clan/dto/clanLogo.dto';

export class GlobalClanLeaderboardEntryDto {
  @Expose()
  rank: number;

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
  @Expose()
  currentPage: number;

  @Expose()
  limit: number;

  @Expose()
  offset: number;

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
