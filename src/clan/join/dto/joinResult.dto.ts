import { IsBoolean, IsMongoId, IsOptional } from "class-validator";

export class JoinResultDto {
    @IsMongoId()
    _id: string;

    @IsOptional()
    @IsBoolean()
    accepted : boolean;
}