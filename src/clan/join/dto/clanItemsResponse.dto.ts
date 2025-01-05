import { Expose, Type } from "class-transformer";
import { ItemDto } from "../../../clanInventory/item/dto/item.dto";

export class ClanItemsResponseDto {
	@Expose()
	@Type(() => ItemDto)
	stockItems: ItemDto[];

	@Expose()
	@Type(() => ItemDto)
	soulHomeItems: ItemDto[];
}
