import {Model} from "mongoose";
import {ClassName} from "../../dictionary";
import PlayerModel from "../../../player/player.model";
import CharacterClassModel from "../../../characterClass/characterClass.model";
import ClanModel from "../../../clan/clan.model";
import CustomCharacterModel from "../../../customCharacter/customCharacter.model";
import BattleCharacterModel from "../../../battleCharacter/battleCharacter.model";
import FurnitureModel from "../../../furniture/furniture.model";
import RaidRoomModel from "../../../raidRoom/raidRoom.model";

export default class ModelFactory {
    public create = (modelName: ClassName): Model<any> => {
        switch (modelName) {
            case ClassName.CHARACTER_CLASS:
                return CharacterClassModel;
            case ClassName.CLAN:
                return ClanModel;
            case ClassName.CUSTOM_CHARACTER:
                return CustomCharacterModel;
            case ClassName.PLAYER:
                return PlayerModel;
            case ClassName.BATTLE_CHARACTER:
                return BattleCharacterModel;
            case ClassName.FURNITURE:
                return FurnitureModel;
            case ClassName.RAID_ROOM:
                return RaidRoomModel;
        }
    }
}