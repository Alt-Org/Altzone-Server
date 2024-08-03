import { Error, Model, MongooseError } from "mongoose";
import { IService, TIServiceCreateManyOptions, TIServiceCreateOneOptions, TIServiceDeleteByIdOptions, TIServiceDeleteManyOptions, TIServiceDeleteOneOptions, TIServiceReadManyOptions, TIServiceReadOneOptions, TIServiceUpdateByIdOptions, TIServiceUpdateManyOptions, TIServiceUpdateOneOptions, TReadByIdOptions } from "./IService";
import ServiceError from "./ServiceError";
import { SEReason } from "./SEReason";

/**
 * Provides all basic operations with DB.
 * 
 * Notice that the class methods do not throw any errors, so they do not have to be wrapped in try-catch block. 
 * 
 * In case of any errors occurred class methods will return an array of ServiceErrors
 */
export default class BasicService implements IService{
    constructor(
        private readonly model: Model<any>
    ){
    }

    async createOne<TInput = any, TOutput = any>(input: TInput, options?: TIServiceCreateOneOptions): Promise<TOutput | ServiceError[]> {
        try {
            return await this.model.create(input);
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }

    async createMany<TInput = any, TOutput = any>(input: TInput[], options?: TIServiceCreateManyOptions): Promise<TOutput | ServiceError[]> {
        try {
            return await this.model.create(input);
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }


    async readOneById<TOutput = any>(_id: string, options?: TReadByIdOptions): Promise<TOutput | ServiceError[]> {
        try {
            return options?.includeRefs ? 
                await this.model.findById(_id, options?.select).populate(options.includeRefs) as TOutput : 
                await this.model.findById(_id, options?.select);
        } catch (error) {
            console.log(error);
            return convertMongooseToServiceErrors(error);
        }
    }

    async readOne<TOutput = any>(options: TIServiceReadOneOptions): Promise<TOutput | ServiceError[]> {
        try {
            const { includeRefs, filter, select } = options;
            return await this.model.findOne(filter, select).populate(includeRefs) as TOutput;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }

    async readMany<TOutput = any>(options?: TIServiceReadManyOptions): Promise<TOutput[] | ServiceError[]> {
        try {
            const { includeRefs, filter, select, ...settings } = options;
            return await this.model.find(filter, select, settings).populate(includeRefs) as TOutput[];
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }


    async updateOneById<TInput = any>(_id: string, input: TInput, options?: TIServiceUpdateByIdOptions): Promise<boolean | ServiceError[]> {
        try {
            const resp = await this.model.updateOne({_id}, input);
            return true;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }

    async updateOne<TInput = any>(input: TInput, options: TIServiceUpdateOneOptions): Promise<boolean | ServiceError[]> {
        try {
            const { filter } = options;
            const resp = await this.model.updateOne(filter, input);
            return true;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }

    async updateMany<TInput = any>(input: TInput[], options: TIServiceUpdateManyOptions): Promise<boolean | ServiceError[]> {
        try {
            const { filter } = options;
            const resp = await this.model.updateMany(filter, input);
            return true;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }


    async deleteOneById(_id: string, options?: TIServiceDeleteByIdOptions): Promise<true | ServiceError[]> {
        try {
            const resp = await this.model.deleteOne({_id});
            return true;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }

    async deleteOne(options: TIServiceDeleteOneOptions): Promise<true | ServiceError[]> {
        try {
            const { filter } = options;
            const resp = await this.model.deleteOne(filter);
            return true;
        } catch (error) {
            return convertMongooseToServiceErrors(error);
        }
    }
    
    async deleteMany(options: TIServiceDeleteManyOptions): Promise<true | ServiceError[]> {
        try {
            const { filter } = options;
            const resp = await this.model.deleteMany(filter);
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

    if(error?.code === 11000)
        return convertUniqueErrorToServiceErrors(error)

    if(!(error instanceof MongooseError))
        return [new ServiceError({ reason: SEReason.MISCONFIGURED, message: 'The error is not of type MongooseError', additional: error })];
    
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
            reason: SEReason.MISCONFIGURED,
            field: error.path,
            message: error.message
        })];
    
    if (error instanceof Error.DocumentNotFoundError)
        return [new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: null,
            message: error.message
        })];

    return [new ServiceError({
        reason: SEReason.UNEXPECTED,
        message: 'Can not convert the error from Mongoose to Service',
        additional: error
    })];
}

function convertValidationMongooseErrorToService(error: any){
    const serviceErrorArgs = {
        reason: SEReason.UNEXPECTED,
        field: error.path,
        message: error.message,
        value: error.value
    };
    
    switch (error.kind) {
        case 'required':
            serviceErrorArgs.reason = SEReason.REQUIRED;
            break;
        case 'enum':
            serviceErrorArgs.reason = SEReason.WRONG_ENUM;
            break;
        case 'min':
            serviceErrorArgs.reason = SEReason.NOT_NUMBER;
            break;
        case 'max':
            serviceErrorArgs.reason = SEReason.NOT_NUMBER;
            break;
        case 'String':
            serviceErrorArgs.reason = SEReason.NOT_STRING;
            break;
        case 'Number':
            serviceErrorArgs.reason = SEReason.NOT_NUMBER;
            break;
        case 'Boolean':
            serviceErrorArgs.reason = SEReason.NOT_BOOLEAN;
            break;
        case 'Array':
            serviceErrorArgs.reason = SEReason.NOT_ARRAY;
            break;
        case 'Object':
            serviceErrorArgs.reason = SEReason.NOT_OBJECT;
            break;
        default:
            serviceErrorArgs.reason = SEReason.UNEXPECTED;
            break;
    }

    return new ServiceError(serviceErrorArgs);
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