import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CharacterClass, publicReferences} from "./characterClass.schema";
import {CustomCharacterService} from "../customCharacter/customCharacter.service";
import BasicService from "../common/service/basicService/BasicService";
import { UpdateCharacterClassDto } from "./dto/updateCharacterClass.dto";
import { TIServiceReadManyOptions, TReadByIdOptions } from "../common/service/basicService/IService";
import { CreateCharacterClassDto } from "./dto/createCharacterClass.dto";
import { CharacterClassDto } from "./dto/characterClass.dto";

//This class represent the service layer of the API. It should contain business logic only. 
//So here should not be defined for example authorization rules or complex validation used by endpoints
/**
 * Class provides functionalities for accessing a DB for CharacterClass collection
 */
@Injectable()
export class CharacterClassService {
    public constructor(
        //Nest injects mongoose model
        @InjectModel(CharacterClass.name) public readonly model: Model<CharacterClass>,
        //Nest can inject some other module service
        private readonly customCharacterService: CustomCharacterService
    ){
        //Preferably use this service instead of mongoose (if possible)
        this.basicService = new BasicService(model);
    }

    public readonly basicService: BasicService;

    /**
    * Creates a new CharacterClass in DB.
    * 
    * @param characterClass - The CharacterClass data to create.
    * @returns  created CharacterClass or an array of service errors if any occurred.
    */
    async createOne(characterClass: CreateCharacterClassDto) {
        //If you need you can specify types for some BasicService methods
        return this.basicService.createOne<CreateCharacterClassDto, CharacterClassDto>(characterClass);
    }

    /**
    * Reads a character class by its _id in DB.
    * 
    * @param _id - The Mongo _id of the CharacterClass to read.
    * @param options - Options for reading the CharacterClass.
    * @returns CharacterClass with the given _id on succeed or an array of ServiceErrors if any occurred.
    */
    async readOneById(_id: string, options?: TReadByIdOptions) {
        let optionsToApply = options;
        //If you need to use mongo populate (="with" and "all" queries), 
        //u should check that the requested additional collections are actually in the schema
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => publicReferences.includes(ref));

        return this.basicService.readOneById<CharacterClassDto>(_id, optionsToApply);
    }

    /**
    * Reads all CharacterClasses based on the provided options.
    * 
    * @param options - Options for reading CharacterClasses.
    * @returns An array of CharacterClasses if succeeded or an array of ServiceErrors if error occurred.
    */
    async readAll(options?: TIServiceReadManyOptions) {
        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => publicReferences.includes(ref));

        return this.basicService.readMany<CharacterClassDto>(optionsToApply);
    }

    /**
    * Updates a CharacterClass by its _id in DB. The _id field is read-only and must be found from the parameter
    * 
    * @param characterClass - The data needs to be updated for the CharacterClass.
    * @returns _true_ if CharacterClass was updated successfully, _false_ if nothing was updated for the CharacterClass, 
     * or a ServiceError array if CharacterClass was not found or something else went wrong.
    */
    async updateOneById(characterClass: UpdateCharacterClassDto) {
        const {_id, ...fieldsToUpdate} = characterClass
        return this.basicService.updateOneById(_id, fieldsToUpdate);
    }

    /**
    * Deletes a CharacterClass its _id from DB.
    * 
    * @param _id - The Mongo _id of the CharacterClass to delete.
    * @returns _true_ if CharacterClass was removed successfully, or a ServiceError array if the CharacterClass was not found or something else went wrong
    */
    async deleteOneById(_id: string) {
        return this.basicService.deleteOneById(_id);
    }
}