import { ModelName } from "../../enum/modelName.enum";
import { IService, TIServiceCreateManyOptions, TIServiceCreateOneOptions, TIServiceDeleteByIdOptions, TIServiceDeleteManyOptions, TIServiceDeleteOneOptions, TIServiceReadManyOptions, TIServiceReadOneOptions, TIServiceUpdateByIdOptions, TIServiceUpdateManyOptions, TIServiceUpdateOneOptions, TReadByIdOptions } from "./IService";
import ServiceError from "./ServiceError";

/**
 * Provides all basic operations with DB.
 * 
 * Notice that the class methods do not throw any errors, so they do not have to be wrapped in try-catch block. 
 * 
 * In case of any errors occurred class methods will return an array of ServiceErrors
 */
export default class BasicService<TReadReturn=any, TCreateReturn=any> implements IService{
    createOne(input: any, options?: TIServiceCreateOneOptions): Promise<any | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    createMany(input: any[], options?: TIServiceCreateManyOptions): Promise<any | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    readOneById(_id: string, options?: TReadByIdOptions): Promise<any | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    readOne(options: TIServiceReadOneOptions): Promise<any | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    readMany(options?: TIServiceReadManyOptions): Promise<any[] | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    updateOneById(_id: string, input: any, options?: TIServiceUpdateByIdOptions): Promise<boolean | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    updateOne(input: any, options: TIServiceUpdateOneOptions): Promise<boolean | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    updateMany(input: any[], options: TIServiceUpdateManyOptions): Promise<boolean | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    deleteOneById(_id: string, options?: TIServiceDeleteByIdOptions): Promise<true | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    deleteOne(options: TIServiceDeleteOneOptions): Promise<true | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
    deleteMany(options: TIServiceDeleteManyOptions): Promise<true | ServiceError[]> {
        throw new Error("Method not implemented.");
    }
}