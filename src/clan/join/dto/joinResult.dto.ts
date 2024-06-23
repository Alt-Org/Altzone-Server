import { IsBoolean, IsMongoId, IsOptional } from "class-validator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('JoinResultDto')
export class JoinResultDto {
    @IsMongoId()
    _id: string;

    @IsOptional()
    @IsBoolean()
    accepted : boolean;
}