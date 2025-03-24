import { Error, Model } from "mongoose";
import { IService, IServiceReturn, TIServiceDeleteManyOptions, TIServiceDeleteOneOptions, TIServiceReadManyOptions, TIServiceReadOneOptions, TIServiceUpdateManyOptions, TIServiceUpdateOneOptions, TReadByIdOptions } from "./IService";
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
    /**
     * 
     * @param model DB model class to query. Can also be injected with @InjectModel() by mongoose
     */
    constructor(
        private readonly model: Model<any>
    ){
    }

    async createOne<TInput = any, TOutput = any>(input: TInput): Promise<IServiceReturn<TOutput>> {
        try {
            const data = await this.model.create(input);
            return [data, null];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }

    async createMany<TInput = any, TOutput = any>(input: TInput[]): Promise<IServiceReturn<TOutput[]>> {
        try {
            const data = await this.model.create(input);
            return [data, null];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }


    async readOneById<TOutput = any>(_id: string, options?: TReadByIdOptions): Promise<IServiceReturn<TOutput>> {
        try {
            const { select, includeRefs } = options ? options : { select: undefined, includeRefs: [] };

            const resp = await this.model.findById(_id, select).populate(includeRefs);

            if(!resp)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified id',
                    field: '_id',
                    value: _id
                })]];

            return [resp, null];
        } catch (error: any) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }

    async readOne<TOutput = any>(options: TIServiceReadOneOptions): Promise<IServiceReturn<TOutput>> {
        try {
            const { filter, select, includeRefs } = options ? options : { filter: undefined, select: undefined, includeRefs: [] };

            const resp = await this.model.findOne(filter, select).populate(includeRefs);

            if(!resp)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified condition'
                })]];

            return [resp, null];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }

    async readMany<TOutput = any>(options?: TIServiceReadManyOptions): Promise<IServiceReturn<TOutput[]>> {
        try {
            const { filter, select, includeRefs, ...settings } = options ? options : { filter: undefined, select: undefined, includeRefs: [] };

            const resp = await this.model.find(filter, select, settings).populate(includeRefs);

            if(!resp || resp.length === 0)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified condition'
                })]];
                
            return [resp, null];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }


    async updateOneById<TInput = any>(_id: string, input: TInput): Promise<IServiceReturn<boolean>> {
        try {
            const resp = await this.model.updateOne({_id}, input);
            if(resp.matchedCount === 0)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified _id',
                    field: '_id',
                    value: _id
                })]];

            const wasUpdated = resp.modifiedCount !== 0;
            return [ wasUpdated, null ];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }

    async updateOne<TInput = any>(input: TInput, options: TIServiceUpdateOneOptions): Promise<IServiceReturn<boolean>> {
        try {
            const { filter } = options ? options : { filter: undefined };
            const filterToApply = Array.isArray(filter) ? { $or: filter } : filter;

            const resp = await this.model.updateOne(filterToApply, input);
            if(resp.matchedCount === 0)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified condition'
                })]];

            const wasUpdated = resp.modifiedCount !== 0;
            return [ wasUpdated, null ];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }

    async updateMany<TInput = any>(input: TInput[], options: TIServiceUpdateManyOptions): Promise<IServiceReturn<boolean>> {
        try {
            const { filter } = options ? options : { filter: undefined };
            const filterToApply = Array.isArray(filter) ? { $or: filter } : filter;
            const resp = await this.model.updateMany(filterToApply, input);
            if(resp.matchedCount === 0)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects with specified condition'
                })]];

            const wasUpdated = resp.modifiedCount !== 0;
            return [ wasUpdated, null ];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }


    async deleteOneById(_id: string): Promise<IServiceReturn<true>> {
        try {
            const resp = await this.model.deleteOne({_id});
            if(resp.deletedCount === 0)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects by specified _id',
                    field: '_id',
                    value: _id
                })]];

            return [true, null];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }

    async deleteOne(options: TIServiceDeleteOneOptions): Promise<IServiceReturn<true>> {
        try {
            const { filter } = options ? options : { filter: undefined };
            const resp = await this.model.deleteOne(filter);
            if(resp.deletedCount === 0)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects by specified condition'
                })]];

            return [true, null];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
        }
    }
    
    async deleteMany(options: TIServiceDeleteManyOptions): Promise<IServiceReturn<true>> {
        try {
            const { filter } = options ? options : { filter: undefined };
            const resp = await this.model.deleteMany(filter);
            if(resp.deletedCount === 0)
                return [null, [new ServiceError({
                    reason: SEReason.NOT_FOUND,
                    message: 'Could not find any objects by specified condition'
                })]];

            return [true, null];
        } catch (error) {
            const errors = convertMongooseToServiceErrors(error);
            return [null, errors];
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
        case 'objectid':
            return SEReason.VALIDATION;
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