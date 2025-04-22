import { MongooseError } from 'mongoose';
import { IBasicService } from '../interface/IBasicService';
import { ThrowNotImplementedMethod } from '../decorator/ThrowNotImplementedMethod.decorator';
import { DeleteOptionsType } from '../type/deleteOptions.type';
import { IgnoreReferencesType } from '../../type/ignoreReferences.type';
import { Discriminator } from '../../enum/discriminator.enum';
import { ModelName } from '../../../common/enum/modelName.enum';
import { IGetAllQuery } from '../../../common/interface/IGetAllQuery';
import { IResponseShape } from '../../interface/IResponseShape';

/**
 * @deprecated
 */
export abstract class BasicServiceDummyAbstract<T = object>
  implements IBasicService<T>
{
  protected constructor() {}
  public readonly discriminators = [Discriminator.IBasicService];

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  createOne(_input: any): Promise<IResponseShape<T> | null | MongooseError> {
    return Promise.resolve(undefined);
  }

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  readAll(
    _query: IGetAllQuery,
  ): Promise<IResponseShape<T> | null | MongooseError> {
    return Promise.resolve(undefined);
  }

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  readOneById(
    _id: string,
    _includeRefs?: ModelName[],
    _metaData?: string[],
  ): Promise<IResponseShape<T> | null | MongooseError> {
    return Promise.resolve(undefined);
  }

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  readOneWithAllCollections(
    _id: string,
  ): Promise<IResponseShape<T> | null | MongooseError> {
    return Promise.resolve(undefined);
  }

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  readOneWithCollections(
    _id: string,
    _withQuery: string,
  ): Promise<IResponseShape<T> | null | MongooseError> {
    return Promise.resolve(undefined);
  }

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  updateOneById(_input: any): Promise<object | MongooseError> {
    return Promise.resolve(undefined);
  }

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  deleteOneById(
    _id: string,
    _ignoreReferences?: IgnoreReferencesType,
  ): Promise<object | MongooseError> {
    return Promise.resolve(undefined);
  }

  @ThrowNotImplementedMethod(BasicServiceDummyAbstract.name, 'AddBasicService')
  deleteByCondition(
    _condition: object,
    _options?: DeleteOptionsType,
    _ignoreReferences?: IgnoreReferencesType,
  ): Promise<object | MongooseError> {
    return Promise.resolve(undefined);
  }
}
