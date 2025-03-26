import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';
import { Chat } from '../../chat/chat.schema';
import { Expose, Type } from 'class-transformer';
import { SessionStage } from '../enum/SessionStage.enum';
import { ObjectId } from 'mongodb';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { PlayerDto } from '../../player/dto/player.dto';
import { ClanDto } from '../../clan/dto/clan.dto';
import { ChatDto } from '../../chat/dto/chat.dto';

export class CreatedBoxDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  accessToken: string;

  @Expose()
  sessionStage: SessionStage;

  @Expose()
  boxRemovalTime: number;

  @Expose()
  sessionResetTime: number;

  @Expose()
  adminProfile_id: ObjectId;

  @Expose()
  adminPlayer_id: ObjectId;

  @Expose()
  clan_ids: ObjectId[];

  @Expose()
  soulHome_ids: ObjectId[];

  @Expose()
  room_ids: ObjectId[];

  @Expose()
  stock_ids: ObjectId[];

  @Expose()
  chat_id: ObjectId;

  @Type(() => PlayerDto)
  @Expose()
  adminPlayer: Player;

  @Type(() => ClanDto)
  @Expose()
  clans: Clan[];

  @Type(() => ChatDto)
  @Expose()
  chat: Chat;
}
