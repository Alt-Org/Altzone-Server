import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from '../../player.schema';
import { registerValidationDecorator } from '../../../common/decorator/validation/registerValidationDecorator';
import { isEntityExists } from '../../../common/decorator/validation/isEntityExists';
import { ModelName } from '../../../common/enum/modelName.enum';

export function IsPlayerExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerValidationDecorator(
      'IsPlayerExists',
      isPlayerExists,
      object,
      propertyName,
      validationOptions,
    );
  };
}

@ValidatorConstraint({ name: isPlayerExists.name, async: true })
@Injectable()
export class isPlayerExists
  extends isEntityExists<Player>
  implements ValidatorConstraintInterface
{
  public constructor(
    @InjectModel(ModelName.PLAYER) private readonly model: Model<Player>,
  ) {
    super(ModelName.PLAYER);
    super.setEntityModel(this.model);
  }
}
