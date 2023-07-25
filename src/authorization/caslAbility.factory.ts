import {AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility} from "@casl/ability";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user";
import {Action} from "./enum/action.enum";
import {Profile} from "../profile/profile.schema";
import {Player} from "../player/player.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {ModelName} from "../common/enum/modelName.enum";
import {Clan} from "../clan/clan.schema";

type AllowedAction =
    Action.create_request | Action.read_request | Action.update_request | Action.delete_request |
    Action.create_response | Action.read_response | Action.update_response | Action.delete_response;

export type AllowedSubject = typeof Profile | typeof Player;
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

        switch (subject) {
            case Profile:

        }

        if(subject.name === ModelName.PROFILE){
            // const userProfile = await this.requestHelperService.getModelInstanceById(ModelName.PROFILE, user.profile_id, Profile);
            // const userPlayer = await this.requestHelperService.getModelInstanceById(ModelName.PLAYER, user.player_id, Player);
            // const userClan = await this.requestHelperService.getModelInstanceById(ModelName.CLAN, userPlayer.clan_id, Clan);
            //
            // console.log(userProfile);
            // console.log(userPlayer);
            // console.log(userClan);

            const commonReadableFields = ['username'];
            const commonUpdatableFields: string[] = [];

            can(Action.read_request, subject);
            can(Action.read_response, subject, commonReadableFields);
            can(Action.read_response, subject, {_id: user.profile_id});
        }

        if(subject.name === ModelName.PLAYER){
            const profileToAccess = await this.requestHelperService.getModelInstanceById(ModelName.PROFILE, user.profile_id, Profile);
            console.log(profileToAccess);
            can(Action.read_response, Player);
            can(Action.read_response, Player, {profile_id: profileToAccess._id});
        }

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
