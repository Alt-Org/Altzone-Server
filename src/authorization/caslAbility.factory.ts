import { InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User } from "../auth/user";
import { Action } from "./enum/action.enum";
import { RequestHelperService } from "../requestHelper/requestHelper.service";
import { ProfileDto } from "../profile/dto/profile.dto";
import { PlayerDto } from "../player/dto/player.dto";
import { UpdateProfileDto } from "../profile/dto/updateProfile.dto";
import { UpdatePlayerDto } from "../player/dto/updatePlayer.dto";
import { CustomCharacterDto } from "../customCharacter/dto/customCharacter.dto";
import { UpdateCustomCharacterDto } from "../customCharacter/dto/updateCustomCharacter.dto";
import { profileRules } from "./rule/profileRules";
import { playerRules } from "./rule/playerRules";
import { customCharacterRules } from "./rule/customCharacterRules";
import { SystemAdminService } from "../common/apiState/systemAdmin.service";
import { systemAdminRules } from "./rule/systemAdminRules";
import { CharacterClassDto } from "../characterClass/dto/characterClass.dto";
import { UpdateCharacterClassDto } from "../characterClass/dto/updateCharacterClass.dto";
import { characterClassRules } from "./rule/characterClassRules";
import { itemRules } from "./rule/itemRules";
import { stockRules } from "./rule/stockRules";
import { clanRules } from "./rule/clanRules";
import { ClanDto } from "src/clan/dto/clan.dto";
import { UpdateClanDto } from "src/clan/dto/updateClan.dto";
import { SupportedAction } from "./authorization.interceptor";
import { JoinDto } from "src/clan/join/dto/join.dto";
import { JoinResultDto } from "src/clan/join/dto/joinResult.dto";
import { joinRules } from "./rule/joinRequestRules";
import { ItemDto } from "../item/dto/item.dto";
import { UpdateItemDto } from "../item/dto/updateItem.dto";
import { StockDto } from "../stock/dto/stock.dto";
import { UpdateStockDto } from "../stock/dto/updateStock.dto";
import { SoulHomeDto } from "src/soulhome/dto/soulhome.dto";
import { updateSoulHomeDto } from "src/soulhome/dto/updateSoulHome.dto";
import { soulHomeRules } from "./rule/soulHomeRules";
import { RoomDto } from "src/Room/dto/room.dto";
import { UpdateRoomDto } from "src/Room/dto/updateRoom.dto";
import { roomRules } from "./rule/roomRules";
import { ClanVoteDto } from "src/shop/clanVote/dto/clanVote.dto";
import { UpdateClanVoteDto } from "src/shop/clanVote/dto/updateClanVote.dto";
import { ItemShopDto } from "src/shop/itemShop/dto/itemshop.dto";
import { clanVoteRules } from "./rule/clanVoteRules";
import { shopRules } from "./rule/shopRules";
import { ShopItemDTO } from "src/shop/itemShop/dto/shopItem.dto";
import { RemovePlayerDTO } from "src/clan/join/dto/removePlayer.dto";
import { isType, ObjectType } from "src/common/base/decorator/AddType.decorator";
import { PlayerLeaveClanDto } from "../clan/join/dto/playerLeave.dto";

export type AllowedAction = Action.create_request | Action.read_request | Action.read_response | Action.update_request | Action.delete_request;

export type AllowedSubject =
    typeof ProfileDto | typeof UpdateProfileDto |
    typeof PlayerDto | typeof UpdatePlayerDto |
    typeof CustomCharacterDto | typeof UpdateCustomCharacterDto |
    typeof CharacterClassDto | typeof UpdateCharacterClassDto |
    typeof ItemDto | typeof UpdateItemDto |
    typeof StockDto | typeof UpdateStockDto |
    typeof ClanDto | typeof UpdateClanDto |
    typeof JoinDto | typeof JoinResultDto | typeof PlayerLeaveClanDto | typeof RemovePlayerDTO |
    typeof SoulHomeDto | typeof updateSoulHomeDto |
    typeof RoomDto | typeof UpdateRoomDto |
    typeof ClanVoteDto | typeof UpdateClanVoteDto |
    typeof ItemShopDto | typeof ShopItemDTO;


type Subjects = InferSubjects<AllowedSubject>;

export type AppAbility = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

/**
 * This class is a factory for returning appropriate rules for specified subjects and actions.
 *
 * In case some new file with rules is created it should be registered here in order to work with \@Authorize() decorator as follows: 
 * - Create a new rule 
 * - Add the subject(s) type to the AllowedSubject type above
 * - Add new if statement in the createForUser()
 */
@Injectable()
export class CASLAbilityFactory {
    public constructor(
        private readonly requestHelperService: RequestHelperService,
        private readonly systemAdminService: SystemAdminService
    ) {
    }
    public createForUser = async (user: User, subject: AllowedSubject, action: SupportedAction, subjectObj: AllowedSubject = undefined): Promise<AppAbility> => {
        const isSystemAdmin = await this.systemAdminService.isSystemAdmin(user.profile_id);
        if (isSystemAdmin)
            return systemAdminRules();

        const obj = new subject() as unknown as ObjectType;

        if (isType(obj, 'ProfileDto') || isType(obj, 'UpdateProfileDto'))
            return profileRules(user, subject, action, subjectObj);
      
        if (isType(obj, 'PlayerDto') || isType(obj, 'UpdatePlayerDto'))
            return playerRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'CustomCharacterDto') || isType(obj, 'UpdateCustomCharacterDto'))
            return customCharacterRules(user, subject, action, subjectObj, this.requestHelperService);
      
        if (obj instanceof CharacterClassDto || isType(obj, 'CharacterClassDto') || isType(obj, 'UpdateCharacterClassDto'))
            return characterClassRules(user, subject, action, subjectObj);
 
        if (isType(obj, 'ItemDto') || isType(obj, 'UpdateItemDto'))
            return itemRules(user, subject, action, subjectObj, this.requestHelperService);
  
        if (isType(obj, 'StockDto') || isType(obj, 'UpdateStockDto'))
            return stockRules(user, subject, action, subjectObj, this.requestHelperService);
        
        if (isType(obj, 'ClanDto') || isType(obj, 'UpdateClanDto'))
            return clanRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'JoinDto') || isType(obj, 'JoinResultDto') || isType(obj, 'PlayerLeaveClan') || isType(obj, 'RemovePlayerDTO'))
            return joinRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'SoulHomeDto') || isType(obj, 'updateSoulHomeDto'))
            return soulHomeRules(user, subject, action, subjectObj, this.requestHelperService)

        if (isType(obj, 'RoomDto') || isType(obj, 'UpdateRoomDto'))
            return roomRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'ClanVoteDto') || isType(obj, 'UpdateClanVoteDto'))
            return clanVoteRules(user, subject, action, subjectObj, this.requestHelperService)

        if (isType(obj, 'ItemShopDto') || isType(obj, 'ShopItemDTO'))
            return shopRules(user, subject, action, subjectObj, this.requestHelperService)

    }
}

