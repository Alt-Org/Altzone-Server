import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {ProfileDto} from "../../profile/dto/profile.dto";
import {Action} from "../enum/action.enum";
import {UpdateProfileDto} from "../../profile/dto/updateProfile.dto";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetter} from "../type/RulesSetter.type";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const profileRules: RulesSetter<Ability, Subjects> = (user, subject, action, subjectObj) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(subject === ProfileDto){
        can(Action.create_request, subject);

        const publicFields = ['_id', 'username'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, publicFields);
        can(Action.read_response, subject, {_id: user.profile_id});

        can(Action.delete_request, subject, {_id: user.profile_id});
    }

    if(subject === UpdateProfileDto){
        can(Action.update_request, subject, ['username', 'password'], {_id: user.profile_id});
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}