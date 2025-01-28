import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacter} from "./customCharacter.schema";
import {IServiceReturn, TIServiceReadManyOptions, TReadByIdOptions} from "../common/service/basicService/IService";
import {CreateCustomCharacterDto} from "./dto/createCustomCharacter.dto";
import ServiceError from "../common/service/basicService/ServiceError";
import {SEReason} from "../common/service/basicService/SEReason";
import {Player} from "../player/player.schema";
import BasicService from "../common/service/basicService/BasicService";
import {CharacterBaseStats} from "./const/CharacterBaseStats";
import {ItemDto} from "../clanInventory/item/dto/item.dto";
import {UpdateCustomCharacterDto} from "./dto/updateCustomCharacter.dto";

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

    /**
     * Reads a custom character by its _id in DB.
     *
     * @param _id - The Mongo _id of the character to read.
     * @param options - Options for reading the character.
     *
     * @returns CustomCharacter with the given _id on succeed or SE NOT_FOUND if nothing was found or REQUIRED if _id is not provided
     */
    async readOneById(_id: string, options?: TReadByIdOptions) {
        if(!_id)
            return [ null, [new ServiceError({ reason: SEReason.REQUIRED, message: '_id is required', field: '_id', value: _id })] ];

        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
        return this.basicService.readOneById<ItemDto>(_id, optionsToApply);
    }

    /**
     * Reads custom characters from DB with specified configuration.
     *
     * Notice that if the options is undefined or null, or filter option is undefined, null or empty object all custom characters will be returned.
     *
     * @param options - Options for reading custom characters.
     *
     * @return found custom characters, or NOT_FOUND if nothing was found
     */
    public readMany = async (options: TIServiceReadManyOptions): Promise<IServiceReturn<CustomCharacter[]>> => {
        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
        return this.basicService.readMany<CustomCharacter>(optionsToApply);
    }

    /**
     * Updates a custom character by its _id in DB. The _id field is read-only and is required
     *
     * @param customCharacterToUpdate - The data needs to be updated for the custom character.
     *
     * @returns _true_ if CustomCharacter was updated successfully, _false_ if nothing was updated for the Item,
     * SE REQUIRED if _id is not provided or SE NOT_FOUND if no characters were found
     */
    async updateOneById(customCharacterToUpdate: UpdateCustomCharacterDto) {
        const {_id, ...fieldsToUpdate} = customCharacterToUpdate;

        if(!_id)
            return [ null, [new ServiceError({ reason: SEReason.REQUIRED, message: '_id is required', field: '_id', value: _id })] ];

        return this.basicService.updateOneById(_id, fieldsToUpdate);
    }

    /**
    /**
     * Deletes custom characters from DB by specified condition.
     *
     * Notice that if the filter is set to an empty object all custom character will be deleted.
     *
     * @param filter condition to delete
     *
     * @return true if custom characters were deleted, SE REQUIRED if the filter is not provided, or NOT_FOUND if nothing was found
     */
    public deleteMany = async (filter: Partial<CustomCharacter>): Promise<IServiceReturn<true>> => {
        if(!filter)
            return [ null, [new ServiceError({ reason: SEReason.REQUIRED, message: 'method params are required' })] ];

        return this.basicService.deleteMany({filter});
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}