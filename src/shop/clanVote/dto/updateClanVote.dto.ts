import { IsBoolean, IsMongoId, IsNumber } from "class-validator";
import AddType from "../../../common/base/decorator/AddType.decorator";

@AddType('UpdateClanVoteDto')
export class UpdateClanVoteDto {
    @IsMongoId()
    _id:string;

    @IsBoolean()
    vote:boolean;
    
    @IsMongoId()
    player_id: string;
}