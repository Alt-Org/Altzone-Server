import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CharacterClass} from "./characterClass.schema";
import {CustomCharacterService} from "../customCharacter/customCharacter.service";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";

@Injectable()
@AddBasicService()
export class CharacterClassService extends BasicServiceDummyAbstract<CharacterClass> implements IBasicService<CharacterClass>{
    public constructor(
        @InjectModel(CharacterClass.name) public readonly model: Model<CharacterClass>,
        private readonly customCharacterService: CustomCharacterService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.CUSTOM_CHARACTER];
        this.modelName = ModelName.CHARACTER_CLASS;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        await this.customCharacterService.deleteByCondition({'characterClass_id': _id});
    }
}