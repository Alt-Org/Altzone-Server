import { MongooseError } from 'mongoose';
import { IgnoreReferencesType } from '../../type/ignoreReferences.type';
import { DeleteOptionsType } from '../type/deleteOptions.type';
import IDiscriminator from '../../interface/IDiscriminator';
import { ModelName } from '../../../common/enum/modelName.enum';
import { IGetAllQuery } from '../../../common/interface/IGetAllQuery';
import { IResponseShape } from '../../interface/IResponseShape';

/**
 * @deprecated
 */
export interface IBasicService<T = object> extends IDiscriminator {
  createOne(input: any): Promise<IResponseShape<T> | null | MongooseError>;

  readOneById(
    _id: string,
    includeRefs?: ModelName[],
  ): Promise<IResponseShape<T> | null | MongooseError>;
  readOneWithCollections(
    _id: string,
    withQuery: string,
  ): Promise<IResponseShape<T> | null | MongooseError>;
  readOneWithAllCollections(
    _id: string,
  ): Promise<IResponseShape<T> | null | MongooseError>;
  readAll(
    query: IGetAllQuery,
  ): Promise<IResponseShape<T> | null | MongooseError>;

  updateOneById(input: any): Promise<object | boolean | MongooseError>;

  deleteOneById(
    _id: string,
    ignoreReferences?: IgnoreReferencesType,
  ): Promise<object | MongooseError>;
  deleteByCondition(
    condition: object,
    options?: DeleteOptionsType,
    ignoreReferences?: IgnoreReferencesType,
  ): Promise<object | MongooseError>;
}
