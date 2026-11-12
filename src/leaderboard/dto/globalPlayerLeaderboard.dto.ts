import { Expose, Type } from 'class-transformer';
import { ClanLogoDto } from '../../clan/dto/clanLogo.dto';
import { AvatarDto } from '../../player/dto/avatar.dto';

export class GlobalPlayerLeaderboardClanDto {
  @Expose()
  clanId: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => ClanLogoDto)
  logo: ClanLogoDto;
}

export class GlobalPlayerLeaderboardEntryDto {
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
  @Type(() => GlobalPlayerLeaderboardClanDto)
  clan: GlobalPlayerLeaderboardClanDto | null;
}

export class GlobalPlayerLeaderboardDto {
  @Expose()
  @Type(() => GlobalPlayerLeaderboardEntryDto)
  entries: GlobalPlayerLeaderboardEntryDto[];

  @Expose()
  ownRank: number | null;
}

export class GlobalPlayerLeaderboardResponseDataDto {
  @Expose()
  @Type(() => GlobalPlayerLeaderboardDto)
  leaderboard: GlobalPlayerLeaderboardDto;
}

export class GlobalPlayerLeaderboardMetaDataDto {
  @Expose()
  dataKey: 'leaderboard';

  @Expose()
  modelName: 'Leaderboard';

  @Expose()
  dataType: 'Object';

  @Expose()
  dataCount: 1;
}

export class GlobalPlayerLeaderboardPaginationDto {
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

export class GlobalPlayerLeaderboardResponseDto {
  @Expose()
  @Type(() => GlobalPlayerLeaderboardResponseDataDto)
  data: GlobalPlayerLeaderboardResponseDataDto;

  @Expose()
  @Type(() => GlobalPlayerLeaderboardMetaDataDto)
  metaData: GlobalPlayerLeaderboardMetaDataDto;

  @Expose()
  @Type(() => GlobalPlayerLeaderboardPaginationDto)
  paginationData: GlobalPlayerLeaderboardPaginationDto;
}
