import { IsMongoId, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('SellItemDto')
export class SellItemDto {
	@IsString()
	@IsMongoId()
	item_id: string;
}
