import {Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects} from "@casl/ability";
import {User} from "../../auth/user";
import {Action} from "../enum/action.enum";
import {Injectable} from "@nestjs/common";

type Subjects = InferSubjects<typeof User | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CASLAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<
            Ability<[Action, Subjects]>
        >(Ability as AbilityClass<AppAbility>);

        // if (user.isAdmin) {
        //     can(Action.Manage, 'all'); // read-write access to everything
        // } else {
        //     can(Action.Read, 'all'); // read-only access to everything
        // }
        //
        // can(Action.Update, Article, { authorId: user.id });
        // cannot(Action.Delete, Article, { isPublished: true });

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
