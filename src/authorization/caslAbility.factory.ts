import {
    AbilityBuilder,
    createMongoAbility,
    ExtractSubjectType,
    InferSubjects,
    MongoAbility
} from "@casl/ability";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user";
import {Action} from "./enum/action.enum";
import {Profile} from "../profile/profile.schema";
import {Player} from "../player/player.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";

type supportedAction =
    Action.create_request | Action.read_request | Action.update_request | Action.delete_request |
    Action.create_response | Action.read_response | Action.update_response | Action.delete_response | 'all';

export type SupportedSubject = typeof Profile | typeof Player;
export type Subjects = InferSubjects<SupportedSubject>;

export type AppAbility = MongoAbility<[supportedAction, Subjects]>;

@Injectable()
export class CASLAbilityFactory {
    public constructor(private readonly requestHelperService: RequestHelperService) {
    }
    createForUser(user: User, subject: SupportedSubject) {
        const { can, cannot, build } =
            new AbilityBuilder<AppAbility>(createMongoAbility);

        //TODO: add logic with requesting needed instances based on subject type

        can('all', Profile);
        can(Action.read_response, Profile, {_id: user.profile_id});

        can('all', Player);
        can(Action.read_response, Player, {_id: user.player_id});

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
