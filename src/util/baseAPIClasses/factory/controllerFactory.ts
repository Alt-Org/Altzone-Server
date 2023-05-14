import ControllerAbstract from "./../controllerAbstract";
import {ClassName} from "../../dictionary";
import PlayerDataController from '../../../playerData/playerData.controller';
import ClanController from "../../../clan/clan.controller";
import CharacterClassController from "../../../characterClass/characterClass.controller";
import CustomCharacterController from "../../../customCharacter/customCharacter.controller";
import BattleCharacterController from "../../../battleCharacter/battleCharacter.controller";
import FurnitureController from "../../../furniture/furniture.controller";
import RaidRoomController from "../../../raidRoom/raidRoom.controller";

export default class ControllerFactory{
    public create = (modelName: ClassName): ControllerAbstract => {
        switch(modelName){
            case ClassName.CHARACTER_CLASS:
                return new CharacterClassController();
            case ClassName.CLAN:
                return new ClanController();
            case ClassName.CUSTOM_CHARACTER:
                return new CustomCharacterController();
            case ClassName.PLAYER_DATA:
                return new PlayerDataController();
            case ClassName.BATTLE_CHARACTER:
                return new BattleCharacterController();
            case ClassName.FURNITURE:
                return new FurnitureController();
            case ClassName.RAID_ROOM:
                return new RaidRoomController();
        }
    }
}