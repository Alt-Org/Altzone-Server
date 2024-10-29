import { ArrayNotEmpty, IsArray, IsMongoId, IsString } from "class-validator";

export class StealItemsDto {
	@IsString()
	steal_token: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsMongoId({ each: true })
	item_ids: string[];

	@IsMongoId()
	room_id: string;
}