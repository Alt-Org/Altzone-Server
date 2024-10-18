import {Expose, Type} from "class-transformer";
import {PlayerDto} from "../../player/dto/player.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {StockDto} from "../../stock/dto/stock.dto";
import AddType from "../../common/base/decorator/AddType.decorator";
import { SoulHomeDto } from "../../soulhome/dto/soulhome.dto";
import { Language } from "../../common/enum/language.enum";
import { AgeRange } from "../enum/ageRange.enum";
import { Goal } from "../enum/goal.enum";

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
    labels: string[];

    @Expose()
    gameCoins: number;

    @Expose()
    points: number;

    @Expose()
    admin_ids: string[];

    @Expose()
    playerCount: number;

    @Expose()
    itemCount: number;

    @Expose()
    stockCount: number;

    @Expose()
    ageRange: AgeRange;

    @Expose()
    goal: Goal;

    @Expose()
    phrase: string;

    @Expose()
    language: Language;

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