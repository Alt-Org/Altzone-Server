import {Injectable} from "@nestjs/common";
import {Error, Model, MongooseError, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {Item} from "./item.schema";
//import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {CreateItemDto} from "./dto/createItem.dto";
import {UpdateItemDto} from "./dto/updateItem.dto";
import {ItemDto} from "./dto/Item.dto";
//import BasicService from "src/common/service/basicService/BasicService";
import { TIServiceReadManyOptions, TReadByIdOptions } from "src/common/service/basicService/IService";
import ServiceError from "src/common/service/basicService/ServiceError";
import { SEReason } from "src/common/service/basicService/SEReason";

@Injectable()
//@AddBasicService()
//export class ItemService extends BasicServiceDummyAbstract<Item> implements IBasicService<Item>{
export class ItemService {
    public constructor(
        @InjectModel(Item.name) public readonly model: Model<Item>,
        //public readonly model: Model<Item>,
        private readonly requestHelperService: RequestHelperService
    ){
        //super();
        this.refsInModel = [ModelName.STOCK];
        this.modelName = ModelName.ITEM;
        //this.basicService = new BasicService(model);
   }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
  //  public readonly basicService: BasicService;

//    public createMany = async (items: CreateItemDto[]): Promise<boolean> => {
//        const resp = await this.model.insertMany(items);
//        return resp && !(resp instanceof MongooseError);
//    }
//    public createManyWithResponse = async (items: CreateItemDto[]) => {
//        const resp = await this.model.insertMany(items);
//        return resp;        
//    }

 //   public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> //=> {
 //   }


  /**
    * Creates a new CharacterClass in DB.
    * 
    * @param characterClass - The CharacterClass data to create.
    * @returns  created CharacterClass or an array of service errors if any occurred.
    */
    async createOne(Item: CreateItemDto) {
        //If you need you can specify types for some BasicService methods
        //return this.basicService.createOne<CreateItemDto, ItemDto>(Item);
        try {
            return await this.model.create(Item);
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }

    async createMany(items: CreateItemDto[]) {
        try {
            return await this.model.create(items);
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
	//return this.basicService.createMany<CreateItemDto, ItemDto[]>(items);
    }
    async createManyWithResponse(items: CreateItemDto[]) {
        try {
            return await this.model.create(items);
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
//	return this.basicService.createMany<CreateItemDto, ItemDto[]>(items);
    }


    /**
    * Reads a character class by its _id in DB.
    * 
    * @param _id - The Mongo _id of the CharacterClass to read.
    * @param options - Options for reading the CharacterClass.
    * @returns CharacterClass with the given _id on succeed or an array of ServiceErrors if any occurred.
    */
    async readOneById(_id: string, options?: TReadByIdOptions) {
        try {
            const { select, includeRefs } = options ? options : { select: undefined, includeRefs: [] };

            const resp = await this.model.findById(_id, select).populate(includeRefs);

            if(!resp)
                return [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified id',
                    field: '_id',
                    value: _id
                })];

            return resp as Item;
        } catch (error: any) {
            return convertMongooseToServiceErrors(error);
        }

  //      let optionsToApply = options;
    //    if(options?.includeRefs)
      //      optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));

       // return this.basicService.readOneById<ItemDto>(_id, optionsToApply);
    }

    /**
    * Reads all CharacterClasses based on the provided options.
    * 
    * @param options - Options for reading CharacterClasses.
    * @returns An array of CharacterClasses if succeeded or an array of ServiceErrors if error occurred.
    */
    //async readAll(options?: TIServiceReadManyOptions) {
    //    let optionsToApply = options;
    //    if(options?.includeRefs)
    //        optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));

    //    return this.basicService.readMany<ItemDto>(optionsToApply);
    //}

    /**
    * Updates a CharacterClass by its _id in DB. The _id field is read-only and must be found from the parameter
    * 
    * @param characterClass - The data needs to be updated for the CharacterClass.
    * @returns _true_ if CharacterClass was updated successfully, _false_ if nothing was updated for the CharacterClass, 
     * or a ServiceError array if CharacterClass was not found or something else went wrong.
    */
    async updateOneById(Item: UpdateItemDto) {
        const {_id, ...fieldsToUpdate} = Item
        //return this.basicService.updateOneById(_id, fieldsToUpdate);
        try {
            const resp = await this.model.updateOne({_id}, fieldsToUpdate);
            if(resp.matchedCount === 0)
                return [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified _id',
                    field: '_id',
                    value: _id
                })];

            return resp.modifiedCount !== 0;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }

    /**
    * Deletes a CharacterClass its _id from DB.
    * 
    * @param _id - The Mongo _id of the CharacterClass to delete.
    * @returns _true_ if CharacterClass was removed successfully, or a ServiceError array if the CharacterClass was not found or something else went wrong
    */
    async deleteOneById(_id: string) {
        //return this.basicService.deleteOneById(_id);
        try {
            const resp = await this.model.deleteOne({_id});
            if(resp.deletedCount === 0)
                return [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects by specified _id',
                    field: '_id',
                    value: _id
                })];
            return true;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }
}

/**
 * Converts Mongoose errors to ServiceError instances.
 * @param error - The Mongoose error to convert.
 * @returns The converted ServiceError instance.
 */
export function convertMongooseToServiceErrors(error?: any): ServiceError[]{
    if(!error)
        return [new ServiceError({ reason: SEReason.MISCONFIGURED, message: 'Provided error is null' })];

    //Not unique field(s)
    if(error?.code === 11000)
        return convertUniqueErrorToServiceErrors(error)

    //Trying to populate collection, which is not related to the requested
    if(error?.name === 'StrictPopulateError' && error?.path)
        return [new ServiceError({ reason: SEReason.NOT_ALLOWED, message: `Reference "${error?.path}" is not in the DB schema`, field: 'includeRefs' })];
    
    if (error instanceof Error.ValidationError) {
        const fieldErrors = Object.values(error.errors);

        if(fieldErrors.length === 0)
            return [new ServiceError({ reason: SEReason.UNEXPECTED, message: 'Could not convert this Mongoose validation error', additional: error })];

        const errors = [];
        for(let i=0,l=fieldErrors.length; i<l; i++)
            errors.push(convertValidationMongooseErrorToService(fieldErrors[i]));
        
        return errors;
    }

    if(error instanceof Error.CastError)
        return [new ServiceError({
            reason: convertMongooseErrorKindToReason(error.kind),
            field: error.path,
            message: error.message
        })];
    
    if (error instanceof Error.DocumentNotFoundError)
        return [new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: null,
            message: error.message
        })];

    if(error?.name == 'Error')
        return [new ServiceError({
            reason: SEReason.UNEXPECTED,
            message: 'Can not convert the JS Error to ServiceError',
            additional: { ...error, message: error?.message, name: error.name }
        })];

    return [new ServiceError({
        reason: SEReason.UNEXPECTED,
        message: 'Can not convert the error from Mongoose to Service',
        additional: error
    })];
}

function convertValidationMongooseErrorToService(error: any){
    const serviceErrorArgs = {
        reason: convertMongooseErrorKindToReason(error.kind),
        field: error.path,
        message: error.message,
        value: error.value
    };

    return new ServiceError(serviceErrorArgs);
}

function convertMongooseErrorKindToReason(kind: string){
    const lowerCaseKind = kind.toLowerCase();
    switch (lowerCaseKind) {
        case 'required':
            return SEReason.REQUIRED;
        case 'enum':
            return SEReason.WRONG_ENUM;
        case 'min':
            return SEReason.NOT_NUMBER;
        case 'max':
            return SEReason.NOT_NUMBER;
        case 'string':
            return SEReason.NOT_STRING;
        case 'number':
            return SEReason.NOT_NUMBER;
        case 'boolean':
            return SEReason.NOT_BOOLEAN;
        case 'array':
            return SEReason.NOT_ARRAY;
        case 'object':
            return SEReason.NOT_OBJECT;
        default:
            return SEReason.UNEXPECTED;
    }
}

/**
 * Converts a MongoDB unique constraint error to an array of ServiceError instances.
 * @param error - The MongoDB unique constraint error to convert.
 * @returns An array of ServiceError instances.
 */
function convertUniqueErrorToServiceErrors(error: any): ServiceError[] {
    const serviceErrors: ServiceError[] = [];

    if(!error || !error.keyPattern)
        return [new ServiceError({
            reason: SEReason.UNEXPECTED,
            message: 'Could not convert Mongoose unique field error to ServiceError',
            additional: error
        })];

    for (const key in error.keyPattern) {
        const value = error.keyValue[key];
        const message = `Field "${key}" with value "${value}" already exists`;

        const serviceError = new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: key,
            value,
            message: message,
            additional: { key, value }
        });

        serviceErrors.push(serviceError);
    }

    return serviceErrors;
}