import {IsEnum, IsInt, IsMongoId} from "class-validator";
import {IsPlayerExists} from "../../player/decorator/validation/IsPlayerExists.decorator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {RaidRoom} from "../../common/enum/raidRoom.enum";

export class CreateRaidRoomDto {
    @IsEnum(RaidRoom)
    @IsInt()
    type: RaidRoom;

    @IsInt()
    rowCount: number;

    @IsInt()
    colCount: number;

    @IsPlayerExists()
    @IsMongoId()
    player_id: string;

    @IsClanExists()
    @IsMongoId()
    clan_id: string;
}