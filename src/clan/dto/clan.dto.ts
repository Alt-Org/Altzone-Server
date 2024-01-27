import {Expose, Type} from "class-transformer";
import {PlayerDto} from "../../player/dto/player.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {RaidRoomDto} from "../../raidRoom/dto/raidRoom.dto";
import {ItemDto} from "../../item/dto/item.dto";

export class ClanDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    tag: string;

    @Expose()
    gameCoins: number;

    @Expose()
    admin_ids: string[];

    @Expose()
    playerCount: number;

    @Expose()
    itemCount: number;

    @Expose()
    raidRoomCount: number;

    @Expose()
    isOpen: boolean

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto[];

    @Type(() => RaidRoomDto)
    @Expose()
    RaidRoom: RaidRoomDto[];

    @Type(() => ItemDto)
    @Expose()
    Item: ItemDto[];
}