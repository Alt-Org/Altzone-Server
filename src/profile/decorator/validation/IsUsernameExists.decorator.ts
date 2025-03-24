import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from '../../profile.schema';
import { registerValidationDecorator } from '../../../common/decorator/validation/registerValidationDecorator';
import { isEntityExists } from '../../../common/decorator/validation/isEntityExists';
import { ModelName } from '../../../common/enum/modelName.enum';

export function IsUsernameExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerValidationDecorator(
      IsUsernameExists.name,
      isUsernameExists,
      object,
      propertyName,
      validationOptions,
    );
  };
}

@ValidatorConstraint({ name: isUsernameExists.name, async: true })
@Injectable()
export class isUsernameExists
  extends isEntityExists<Profile>
  implements ValidatorConstraintInterface
{
  public constructor(
    @InjectModel(ModelName.PROFILE) private readonly model: Model<Profile>,
  ) {
    super(ModelName.PROFILE, 'username');
    super.setEntityModel(this.model);
  }
}
