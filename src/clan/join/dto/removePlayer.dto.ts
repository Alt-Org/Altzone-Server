import { IsMongoId } from "class-validator";
import AddType from "src/common/base/decorator/AddType.decorator";
import { IsPlayerExists } from "src/player/decorator/validation/IsPlayerExists.decorator";

@AddType('RemovePlayerDTO')
export class RemovePlayerDTO {
    @IsPlayerExists()
    @IsMongoId()
    player_id: string; // whom to remove from Clan
}