import { IsBoolean, IsMongoId, IsOptional, IsString } from "class-validator";

export class JoinResultDto {
    @IsMongoId()
    _id: string;

    @IsBoolean()
    accepted : boolean;
}