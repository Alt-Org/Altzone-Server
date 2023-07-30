import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {PlayerDto} from "../../player/dto/player.dto";
import {UpdatePlayerDto} from "../../player/dto/updatePlayer.dto";
import {RulesSetter} from "../type/rulesSetter.type";

type Subjects = InferSubjects<typeof PlayerDto | typeof UpdatePlayerDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const playerRules: RulesSetter<Ability, Subjects> = (user, subject) => {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(subject === PlayerDto){
        can(Action.create_request, subject);

        const publicFields = ['_id', 'name', 'uniqueIdentifier'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, publicFields);
        can(Action.read_response, subject, {_id: user.player_id});

        can(Action.delete_request, subject, {_id: user.player_id});
    }

    if(subject === UpdatePlayerDto){
        can(Action.update_request, subject, {_id: user.player_id});
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}