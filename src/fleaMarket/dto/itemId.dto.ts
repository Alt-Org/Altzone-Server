import { IsMongoId, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('ItemIdDto')
export class ItemIdDto {
	@IsString()
	@IsMongoId()
	item_id: string;
}
