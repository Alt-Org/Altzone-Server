import { AllowedAction } from "../caslAbility.factory";
import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Action } from "../enum/action.enum";
import { RulesSetter, RulesSetterAsync } from "../type/RulesSetter.type";
import { SoulHomeDto } from "../../soulhome/dto/soulhome.dto";
import { UpdateSoulHomeDto } from "../../soulhome/dto/updateSoulHome.dto";
import { getClan_id } from "../util/getClan_id";
import { NotFoundException } from "@nestjs/common";
import { ModelName } from "../../common/enum/modelName.enum";
import { ClanDto } from "../../clan/dto/clan.dto";
import { Model, MongooseError } from "mongoose";
import { RoomDto } from "../../room/dto/room.dto";
import { PlayerDto } from "../../player/dto/player.dto";
import { UpdateRoomDto } from "../../room/dto/updateRoom.dto";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const roomRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if (action === Action.read || action === Action.create) {
        can(Action.read_request, subject);
        can(Action.read_response, subject);
        can(Action.create_request, subject);
    }

    if (action === Action.update || action === Action.delete) {
        const room = await requestHelperService.getModelInstanceById(ModelName.ROOM, subjectObj._id, RoomDto);
        if (!room|| room instanceof MongooseError)
            throw new NotFoundException('Can not check ownership, room with that id not found'); 
        // if(room.player_id !== user.player_id)
        //     throw new NotFoundException("PlayerID does not match owner")
        
        can(Action.update_request, subject);
        can(Action.delete_request, subject);

    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}