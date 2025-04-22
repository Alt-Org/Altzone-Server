import { IsMongoId } from 'class-validator';

/**
 * Class for validating whenever an object contain _id field and that it has a valid Mongo _id value.
 *
 * Typically used to check url parameter.
 *
 * Notice that in case the object does not container the _id field or it's in wrong format it will throw _class-validator_ error
 *
 * @example ```ts
 * public getClanById(\@Param() param: _idDto) {
 *     return this.service.readOneById(param._id);
 * }
 *```
 */
export class _idDto {
  @IsMongoId()
  _id: string;
}
