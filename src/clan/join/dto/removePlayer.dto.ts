import { IsMongoId } from "class-validator";
import AddType from "../../../common/base/decorator/AddType.decorator";
import { IsPlayerExists } from "../../../player/decorator/validation/IsPlayerExists.decorator";

@AddType('RemovePlayerDTO')
export class RemovePlayerDTO {
    @IsPlayerExists()
    @IsMongoId()
    player_id: string; // whom to remove from Clan
}