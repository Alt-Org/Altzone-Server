import {AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility} from "@casl/ability";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user";
import {Action} from "./enum/action.enum";
import {Profile} from "../profile/profile.schema";
import {Player} from "../player/player.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {ProfileDto} from "../profile/dto/profile.dto";
import {PlayerDto} from "../player/dto/player.dto";
import {UpdateProfileDto} from "../profile/dto/updateProfile.dto";
import {CreateProfileDto} from "../profile/dto/createProfile.dto";
import {UpdatePlayerDto} from "../player/dto/updatePlayer.dto";
import {CreatePlayerDto} from "../player/dto/createPlayer.dto";

type AllowedAction = Action.create_request | Action.read_request | Action.read_response | Action.update_request | Action.delete_request;

export type AllowedSubject =
    typeof ProfileDto | typeof UpdateProfileDto |
    typeof CreatePlayerDto | typeof PlayerDto | typeof UpdatePlayerDto;
export type Subjects = InferSubjects<AllowedSubject>;

export type AppAbility = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

@Injectable()
export class CASLAbilityFactory {
    public constructor(private readonly requestHelperService: RequestHelperService) {
    }
    public createForUser = async (user: User, subject: AllowedSubject) => {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        //TODO: add logic with requesting needed instances based on subject type

        //can(Action.manage, 'all');

        if(subject === ProfileDto){
            can(Action.create_request, subject);

            const commonReadableFields = ['username'];
            can(Action.read_request, subject);
            can(Action.read_response, subject, commonReadableFields);
            can(Action.read_response, subject, {_id: user.profile_id});

            can(Action.delete_request, subject, {username: user.profile_id});
        }
        if(subject === UpdateProfileDto){
            can(Action.update_request, subject, {username: user.username});
        }

        // if(subject === PlayerDto || subject === Player){
        //     const commonReadableFields = ['name'];
        //
        //     can(Action.create_request, subject);
        //
        //     can(Action.read_request, subject);
        //     can(Action.read_response, subject, commonReadableFields);
        //     can(Action.read_response, subject, {_id: user.player_id});
        //
        //     can(Action.update_request, subject, {_id: user.player_id});
        //
        //     can(Action.delete_request, subject, {_id: user.player_id});
        // }

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
