import { IsMongoId, IsString } from "class-validator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('CreateRoomDto')
export class CreateRoomDto {
  @IsString() 
  floorType: string;

  @IsString()
  wallType: string;

  @IsMongoId()
  player_id: string

  @IsMongoId()
  soulHome_id:string;

}