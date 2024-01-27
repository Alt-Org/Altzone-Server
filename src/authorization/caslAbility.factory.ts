import {InferSubjects, MongoAbility} from "@casl/ability";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user";
import {Action} from "./enum/action.enum";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {ProfileDto} from "../profile/dto/profile.dto";
import {PlayerDto} from "../player/dto/player.dto";
import {UpdateProfileDto} from "../profile/dto/updateProfile.dto";
import {UpdatePlayerDto} from "../player/dto/updatePlayer.dto";
import {CustomCharacterDto} from "../customCharacter/dto/customCharacter.dto";
import {UpdateCustomCharacterDto} from "../customCharacter/dto/updateCustomCharacter.dto";
import {profileRules} from "./rule/profileRules";
import {playerRules} from "./rule/playerRules";
import {customCharacterRules} from "./rule/customCharacterRules";
import {SystemAdminService} from "../common/apiState/systemAdmin.service";
import {systemAdminRules} from "./rule/systemAdminRules";
import {CharacterClassDto} from "../characterClass/dto/characterClass.dto";
import {UpdateCharacterClassDto} from "../characterClass/dto/updateCharacterClass.dto";
import {characterClassRules} from "./rule/characterClassRules";
import { itemRules } from "./rule/itemRules";
import { stockRules } from "./rule/stockRules";
import { clanRules } from "./rule/clanRules";
import { ClanDto } from "src/clan/dto/clan.dto";
import { UpdateClanDto } from "src/clan/dto/updateClan.dto";
import {SupportedAction} from "./authorization.interceptor";
import {ClanMetaDto} from "../metaData/clan/dto/clanMeta.dto";
import {metaDataRules} from "./rule/metaDataRules";
import { JoinDto } from "src/clan/join/dto/join.dto";
import { JoinRequestDto } from "src/clan/join/dto/joinRequest.dto";
import { JoinResultDto } from "src/clan/join/dto/joinResult.dto";
import { joinRules } from "./rule/joinRequestRules";
import {ItemDto} from "../item/dto/item.dto";
import {UpdateItemDto} from "../item/dto/updateItem.dto";
import {StockDto} from "../stock/dto/stock.dto";
import {UpdateStockDto} from "../stock/dto/updateStock.dto";

export type AllowedAction = Action.create_request | Action.read_request | Action.read_response | Action.update_request | Action.delete_request;

export type AllowedSubject =
    typeof ProfileDto | typeof UpdateProfileDto |
    typeof PlayerDto | typeof UpdatePlayerDto |
    typeof CustomCharacterDto | typeof UpdateCustomCharacterDto |
    typeof CharacterClassDto | typeof UpdateCharacterClassDto |
    typeof ItemDto | typeof UpdateItemDto |
    typeof StockDto | typeof UpdateStockDto |
    typeof ClanDto | typeof UpdateClanDto | 
    typeof JoinDto | typeof JoinResultDto ; 

type Subjects = InferSubjects<AllowedSubject>;

export type AppAbility = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

@Injectable()
export class CASLAbilityFactory {
    public constructor(
        private readonly requestHelperService: RequestHelperService,
        private readonly systemAdminService: SystemAdminService
    ) {
    }
    public createForUser = async (user: User, subject: AllowedSubject, action: SupportedAction, subjectObj: AllowedSubject = undefined): Promise<AppAbility> => {
        const isSystemAdmin = await this.systemAdminService.isSystemAdmin(user.profile_id);
        if(isSystemAdmin)
            return systemAdminRules();

        if(subject === ProfileDto || subject === UpdateProfileDto)
            return profileRules(user, subject, action, subjectObj);

        if(subject === PlayerDto || subject === UpdatePlayerDto)
            return playerRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === CustomCharacterDto || subject === UpdateCustomCharacterDto)
            return customCharacterRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === CharacterClassDto || subject === UpdateCharacterClassDto)
            return characterClassRules(user, subject, action, subjectObj);

        if(subject === ItemDto || subject === UpdateItemDto)
            return itemRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === StockDto || subject === UpdateStockDto)
            return stockRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === ClanDto || subject === UpdateClanDto)
            return clanRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === JoinDto || subject === JoinResultDto) 
            return joinRules(user,subject,action,subjectObj, this.requestHelperService);
        
    }
}
