import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../../chat.schema';
import { registerValidationDecorator } from '../../../common/decorator/validation/registerValidationDecorator';
import { isEntityExists } from '../../../common/decorator/validation/isEntityExists';
import { ModelName } from '../../../common/enum/modelName.enum';

export function IsChatExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerValidationDecorator(
      IsChatExists.name,
      isChatExists,
      object,
      propertyName,
      validationOptions,
    );
  };
}

@ValidatorConstraint({ name: isChatExists.name, async: true })
@Injectable()
export class isChatExists
  extends isEntityExists<Chat>
  implements ValidatorConstraintInterface
{
  public constructor(
    @InjectModel(ModelName.CHAT) private readonly model: Model<Chat>,
  ) {
    super(ModelName.CHAT);
    super.setEntityModel(this.model);
  }
}
