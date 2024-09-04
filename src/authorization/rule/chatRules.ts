import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/RulesSetter.type";
import {ModelName} from "../../common/enum/modelName.enum";
import {PlayerDto} from "../../player/dto/player.dto";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const chatRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    const loggedPlayer = await requestHelperService.getModelInstanceById(ModelName.PLAYER, user.player_id, PlayerDto);

    if(loggedPlayer.above13){
        can(Action.create_request, subject);

        can(Action.read_request, subject);
        can(Action.read_response, subject);

        can(Action.update_request, subject);

        can(Action.delete_request, subject);
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}