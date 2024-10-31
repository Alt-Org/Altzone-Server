import { AllowedAction } from "../caslAbility.factory";
import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Action } from "../enum/action.enum";
import { RulesSetterAsync } from "../type/RulesSetter.type";
import { NotFoundException } from "@nestjs/common";
import { ModelName } from "../../common/enum/modelName.enum";
import { MongooseError } from "mongoose";
import { RoomDto } from "../../clanInventory/room/dto/room.dto";

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