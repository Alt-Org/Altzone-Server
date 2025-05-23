import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RequestHelperService } from '../../requestHelper/requestHelper.service';
import { IgnoreReferencesType } from '../../common/type/ignoreReferences.type';
import { ModelName } from '../../common/enum/modelName.enum';
import { CustomCharacter } from './customCharacter.schema';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
  TIServiceReadOneOptions,
  TIServiceUpdateOneOptions,
  TReadByIdOptions,
} from '../../common/service/basicService/IService';
import { CreateCustomCharacterDto } from './dto/createCustomCharacter.dto';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { Player } from '../schemas/player.schema';
import BasicService from '../../common/service/basicService/BasicService';
import { CharacterBaseStats } from './const/CharacterBaseStats';
import { UpdateCustomCharacterDto } from './dto/updateCustomCharacter.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class CustomCharacterService {
  public constructor(
    @InjectModel(CustomCharacter.name)
    public readonly customCharacterModel: Model<CustomCharacter>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    private readonly requestHelperService: RequestHelperService,
  ) {
    this.refsInModel = [ModelName.PLAYER];
    this.modelName = ModelName.CUSTOM_CHARACTER;
    this.basicService = new BasicService(customCharacterModel);
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
  public createOne = async (
    customCharacterToCreate: CreateCustomCharacterDto,
    owner_id: string,
  ): Promise<IServiceReturn<CustomCharacter>> => {
    const [isCharacterValid, characterValidationErrors] =
      await this.validateCustomCharacter(customCharacterToCreate, owner_id);
    if (!isCharacterValid) {
      return [null, characterValidationErrors];
    }

    const expectedSpecs =
      CharacterBaseStats[customCharacterToCreate.characterId];

    const newCharacter: CustomCharacter = {
      ...expectedSpecs,
      ...customCharacterToCreate,
      player_id: owner_id as any,
    };

    return this.basicService.createOne<CustomCharacter, CustomCharacter>(
      newCharacter,
    );
  };

  /**
   * Validate the CustomCharacter creation request.
   *
   * @param customCharacterToCreate  custom character data to validate
   * @param characterId player _id, which will own the character
   *
   * @return validate CustomCharacter or ServiceErrors if any occurred
   */
  private validateCustomCharacter = async (
    customCharacterToCreate: CreateCustomCharacterDto,
    characterId: string,
  ): Promise<IServiceReturn<true>> => {
    if (!customCharacterToCreate || !characterId)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'method params are required',
          }),
        ],
      ];

    const isPlayerExists = await this.playerModel.findById(characterId);
    if (!isPlayerExists)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'owner_id',
            value: characterId,
            message: 'Player with that _id does not exist',
          }),
        ],
      ];

    const isCustomCharacterExists = await this.customCharacterModel.findOne({
      characterId: customCharacterToCreate.characterId,
      player_id: new ObjectId(characterId),
    });

    if (isCustomCharacterExists) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'characterId',
            value: characterId,
            message: 'Custom character already exists with this characterId',
          }),
        ],
      ];
    }

    return [true, null];
  };

  /**
   * Reads a custom character by its _id in DB.
   *
   * @param _id - The Mongo _id of the character to read.
   * @param options - Options for reading the character.
   *
   * @returns CustomCharacter with the given _id on succeed or SE NOT_FOUND if nothing was found or REQUIRED if _id is not provided
   */
  async readOneById(
    _id: string,
    options?: TReadByIdOptions,
  ): Promise<IServiceReturn<CustomCharacter>> {
    if (!_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: '_id is required',
            field: '_id',
            value: _id,
          }),
        ],
      ];

    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );
    return this.basicService.readOneById<CustomCharacter>(_id, optionsToApply);
  }

  /**
   * Reads a custom character by specified condition.
   *
   * @param options - Options for reading the character.
   *
   * @returns found CustomCharacter or SE NOT_FOUND if nothing was found or REQUIRED if options param is not provided
   */
  async readOne(
    options: TIServiceReadOneOptions<CustomCharacter>,
  ): Promise<IServiceReturn<CustomCharacter>> {
    if (!options)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'options param is required',
            field: 'options',
            value: options,
          }),
        ],
      ];

    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );
    return this.basicService.readOne<CustomCharacter>(optionsToApply);
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
  public readMany = async (
    options: TIServiceReadManyOptions,
  ): Promise<IServiceReturn<CustomCharacter[]>> => {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );
    return this.basicService.readMany<CustomCharacter>(optionsToApply);
  };

  /**
   * Reads custom characters that player has chosen as a battle characters
   *
   * Notice that if some characters are not found, they will be ignored.
   *
   * Notice that if some characters does not belong to the logged-in player they will be ignored.
   *
   * @param player_id - player _id for which characters to get
   *
   * @return found custom characters, or NOT_FOUND if nothing was found, or SE REQUIRED if the player_id is null or undefined
   */
  public readPlayerBattleCharacters = async (
    player_id: string,
  ): Promise<IServiceReturn<CustomCharacter[]>> => {
    if (!player_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'player_id is required',
            field: 'player_id',
            value: player_id,
          }),
        ],
      ];

    const player = await this.playerModel.findById(player_id);

    if (!player)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'player_id',
            value: player_id,
            message: 'Player with that _id does not exist',
          }),
        ],
      ];

    return this.basicService.readMany({
      filter: {
        player_id: player._id,
        _id: { $in: player.battleCharacter_ids },
      },
    });
  };

  /**
   * Updates a custom character by its _id in DB. The _id field is read-only and is required
   *
   * @param customCharacterToUpdate - The data needs to be updated for the custom character.
   *
   * @returns _true_ if CustomCharacter was updated successfully, _false_ if nothing was updated for the CustomCharacter,
   * SE REQUIRED if _id is not provided or SE NOT_FOUND if no characters were found
   */
  async updateOneById(customCharacterToUpdate: UpdateCustomCharacterDto) {
    const { _id, ...fieldsToUpdate } = customCharacterToUpdate;

    if (!_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: '_id is required',
            field: '_id',
            value: _id,
          }),
        ],
      ];

    return this.basicService.updateOneById(_id, fieldsToUpdate);
  }

  /**
   * Updates a custom character by specified condition in DB.
   *
   * @param customCharacterToUpdate - The data needs to be updated for the custom character.
   * @param condition - Condition on which to update
   *
   * @returns _true_ if CustomCharacter was updated successfully, _false_ if nothing was updated for the CustomCharacter,
   * SE REQUIRED if params are not provided or SE NOT_FOUND if no character were found
   */
  async updateOneByCondition(
    customCharacterToUpdate: Partial<CustomCharacter>,
    condition: TIServiceUpdateOneOptions<CustomCharacter>,
  ) {
    if (!customCharacterToUpdate || !condition)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'method params are required',
          }),
        ],
      ];

    const { _id, ...fieldsToUpdate } = {
      ...customCharacterToUpdate,
      _id: null,
    };

    return this.basicService.updateOne(fieldsToUpdate, condition);
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
  public deleteMany = async (
    filter: Partial<CustomCharacter>,
  ): Promise<IServiceReturn<true>> => {
    if (!filter)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'method params are required',
          }),
        ],
      ];

    return this.basicService.deleteMany({ filter });
  };

  public clearCollectionReferences = async (
    _id: Types.ObjectId,
    _ignoreReferences?: IgnoreReferencesType,
  ): Promise<void> => {};
}
