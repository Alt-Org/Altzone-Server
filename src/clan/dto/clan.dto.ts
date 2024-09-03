import {Expose, Type} from "class-transformer";
import {PlayerDto} from "../../player/dto/player.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {StockDto} from "../../stock/dto/stock.dto";
import AddType from "../../common/base/decorator/AddType.decorator";
import { SoulHomeDto } from "../../soulhome/dto/soulhome.dto";

@AddType('ClanDto')
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
    stockCount: number;

    @Expose()
    isOpen: boolean

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto[];

    @Type(() => StockDto)
    @Expose()
    Stock: StockDto;

    @Type(() => SoulHomeDto)
    @Expose()
    SoulHome: SoulHomeDto;
}