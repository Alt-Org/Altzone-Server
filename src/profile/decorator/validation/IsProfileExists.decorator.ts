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

export function IsProfileExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerValidationDecorator(
      IsProfileExists.name,
      isProfileExists,
      object,
      propertyName,
      validationOptions,
    );
  };
}

@ValidatorConstraint({ name: isProfileExists.name, async: true })
@Injectable()
export class isProfileExists
  extends isEntityExists<Profile>
  implements ValidatorConstraintInterface
{
  public constructor(
    @InjectModel(ModelName.PROFILE) private readonly model: Model<Profile>,
  ) {
    super(ModelName.PROFILE);
    super.setEntityModel(this.model);
  }
}
