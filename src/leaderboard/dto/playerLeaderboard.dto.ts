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
  @Expose()
  rank: number;

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
