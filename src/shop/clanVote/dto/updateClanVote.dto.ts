import { IsBoolean, IsMongoId, IsNumber } from "class-validator";

export class updateClanVoteDto {
    @IsMongoId()
    _id:string;

    @IsBoolean()
    vote:boolean;
    
    @IsMongoId()
    player_id: string;
}