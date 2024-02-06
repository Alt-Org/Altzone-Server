import { IsMongoId, IsString } from "class-validator";

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