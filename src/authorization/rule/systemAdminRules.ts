import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";

export const systemAdminRules = () => {
    const { can, build } = new AbilityBuilder<any>(createMongoAbility);

    can(Action.manage, 'all');

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<any>,
    });
}