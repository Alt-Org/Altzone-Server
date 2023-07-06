import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {AddBaseService} from "../common/base/decorator/AddBaseService.decorator";
import {ServiceDummyAbstract} from "../common/base/serviceDummy.abstract";
import {IService} from "../common/base/interface/IService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CharacterClass} from "./characterClass.schema";
import {CustomCharacterService} from "../customCharacter/customCharacter.service";

@Injectable()
@AddBaseService()
export class CharacterClassService extends ServiceDummyAbstract implements IService{
    public constructor(
        @InjectModel(CharacterClass.name) public readonly model: Model<CharacterClass>,
        private readonly customCharacterService: CustomCharacterService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        await this.customCharacterService.deleteByCondition({'characterClass_id': _id});
    }
}