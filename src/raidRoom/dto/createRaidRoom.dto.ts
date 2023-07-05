import {IsEnum, IsInt, IsMongoId} from "class-validator";
import {IsPlayerExists} from "../../player/decorator/validation/IsPlayerExists.decorator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {RaidRoom} from "../../common/enum/raidRoom.enum";

export class CreateRaidRoomDto {
    @IsEnum(RaidRoom)
    @IsInt()
    type: RaidRoom;

    @IsInt()
    rowCount: number;

    @IsInt()
    colCount: number;

    @IsPlayerExists()
    @IsMongoId()
    player_id: string;

    @IsClanExists()
    @IsMongoId()
    clan_id: string;
}

// type: { type: Number, required: true },
//     rowCount: { type: Number, required: true },
//     colCount: { type: Number, required: true },
//
//     player_id: {
//         type: Schema.Types.ObjectId,
//         required: true,
//         ref: ModelName.PLAYER,
//         validate : {
//             isAsync: true,
//             validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.PLAYER), v)
//         }
//     },
//
//     clan_id: {
//         type: Schema.Types.ObjectId,
//         required: true,
//         ref: ModelName.CLAN,
//         validate : {
//             isAsync: true,
//             validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ModelName.CLAN), v)
//         }
//     }