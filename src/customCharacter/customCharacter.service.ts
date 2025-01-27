import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacter} from "./customCharacter.schema";
import {IServiceReturn} from "../common/service/basicService/IService";
import {CreateCustomCharacterDto} from "./dto/createCustomCharacter.dto";
import ServiceError from "../common/service/basicService/ServiceError";
import {SEReason} from "../common/service/basicService/SEReason";
import {Player} from "../player/player.schema";
import BasicService from "../common/service/basicService/BasicService";
import {CharacterBaseStats} from "./const/CharacterBaseStats";

@Injectable()
export class CustomCharacterService {
    public constructor(
        @InjectModel(CustomCharacter.name) public readonly model: Model<CustomCharacter>,
        @InjectModel(Player.name) public readonly playerModel: Model<Player>,
        private readonly requestHelperService: RequestHelperService
    ){
        this.refsInModel = [ModelName.PLAYER];
        this.modelName = ModelName.CUSTOM_CHARACTER;
        this.basicService = new BasicService(model);
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    private readonly basicService: BasicService;

    /**
     * Creates a new CustomCharacter in DB.
     *
     * @param customCharacterToCreate  custom character data to create
     * @param owner_id player _id, which will own the character
     *
     * @return created CustomCharacter or ServiceErrors if any occurred
     */
    public createOne = async (customCharacterToCreate: CreateCustomCharacterDto, owner_id: string): Promise<IServiceReturn<CustomCharacter>> => {
        if(!customCharacterToCreate || !owner_id)
            return [ null, [new ServiceError({ reason: SEReason.REQUIRED, message: 'method params are required' })] ];

        const isPlayerExists = await this.playerModel.findById(owner_id);
        if(!isPlayerExists)
            return [null, [new ServiceError({
                reason: SEReason.NOT_FOUND, field: 'owner_id', value: owner_id,
                message: 'Player with that _id does not exist'
            })]];

        const expectedSpecs = CharacterBaseStats[customCharacterToCreate.characterId];

        const newCharacter: CustomCharacter = {...expectedSpecs, ...customCharacterToCreate, player_id: (owner_id as any)}

        return this.basicService.createOne<CustomCharacter, CustomCharacter>(newCharacter);
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}