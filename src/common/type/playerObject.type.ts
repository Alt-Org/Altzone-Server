import { Types } from 'mongoose';
import { CustomCharacter } from '../../player/customCharacter/customCharacter.schema';
import { ClanDto } from '../../clan/dto/clan.dto';

export type PlayerObject = {
  _id: string;
  name: string;
  points: number;
  battlePoints: number;
  claimableRewards: number[];
  backpackCapacity: number;
  uniqueIdentifier: string;
  above13?: boolean;
  parentalAuth?: boolean;
  currentAvatarId?: number;
  avatar?: any;
  gameStatistics?: any;
  classStatistics?: Map<string, { gamesPlayed: number; wins: number }>;
  characterStatistics?: Map<string, { gamesPlayed: number; wins: number }>;
  profile_id?: string;
  clan_id?: string;
  clanRole_id?: string | null;
  battleCharacter_ids?: string[] | Types.ObjectId[];
  Clan?: ClanDto;
  CustomCharacter?: CustomCharacter[];
  clanName?: string | null;
};
