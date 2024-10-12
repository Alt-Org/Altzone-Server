import { IsMongoId, IsString, IsEnum, ValidateIf } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { MoveTo } from "../enum/moveTo.enum";

@AddType('MoveItemDto')
export class MoveItemDto {
    @IsMongoId()
	@IsString()
	item_id: string;

	@IsEnum(MoveTo)
	moveTo: MoveTo; 

    @ValidateIf(o => o.move_to === MoveTo.ROOM)
    @IsMongoId()
    destination_id: string;
}