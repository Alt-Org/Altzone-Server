import { Expose, Type } from 'class-transformer';
import { CustomCharacterDto } from '../../player/customCharacter/dto/customCharacter.dto';
import { ClanDto } from '../../clan/dto/clan.dto';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { GameStatisticsDto } from '../../player/dto/gameStatistics.dto';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('ClaimAccountResponseDto')
export class ClaimAccountResponseDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  points: number;

  @Expose()
  backpackCapacity: number;

  @Expose()
  above13?: boolean | null;

  @Expose()
  parentalAuth: boolean | null;

  @Type(() => GameStatisticsDto)
  @Expose()
  gameStatistics: GameStatisticsDto;

  @Expose()
  battleCharacter_ids?: string[];

  @Expose()
  currentAvatarId?: number;

  @ExtractField()
  @Expose()
  profile_id: string;

  @ExtractField()
  @Expose()
  clan_id: string;

  @Type(() => ClanDto)
  @Expose()
  Clan: ClanDto;

  @Type(() => CustomCharacterDto)
  @Expose()
  CustomCharacter: CustomCharacterDto[];

  @Expose()
  accessToken: string;

  @Expose()
  password: string;
}
