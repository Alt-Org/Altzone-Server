import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {ProfileDto} from "../../profile/dto/profile.dto";

export const systemAdminRules = () => {
    const { can, build } = new AbilityBuilder<any>(createMongoAbility);

    can(Action.manage, 'all');
    can(Action.read_response, ProfileDto, ['_id', 'username', 'Player']);

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<any>,
    });
}