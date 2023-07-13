import {Expose} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";

export class ProfileDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    username: string;
}