import { IsMongoId } from 'class-validator';

export class ClanPlayerLeaderboardParamDto {
  @IsMongoId()
  clanId: string;
}
