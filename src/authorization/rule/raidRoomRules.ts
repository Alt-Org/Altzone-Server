import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetter} from "../type/RulesSetter.type";
import { RaidRoomDto } from "src/raidRoom/dto/raidRoom.dto";
import { UpdateRaidRoomDto } from "src/raidRoom/dto/updateRaidRoom.dto";

type Subjects = InferSubjects<typeof RaidRoomDto | typeof UpdateRaidRoomDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const raidRoomRules: RulesSetter<Ability, Subjects> = (user, subject) => {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(subject === RaidRoomDto){
        can(Action.create_request, subject, {clan_id: user.clan_id});

        //const publicFields = ['_id', 'name', 'uniqueIdentifier'];
        can(Action.read_request, subject);
        can(Action.read_response, subject, {clan_id: user.clan_id});

        can(Action.delete_request, subject, {clan_id: user.clan_id});
    }

    if(subject === UpdateRaidRoomDto){
        can(Action.update_request, subject, {clan_id: user.clan_id});
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}