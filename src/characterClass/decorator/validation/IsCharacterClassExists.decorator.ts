import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { registerValidationDecorator } from '../../../common/decorator/validation/registerValidationDecorator';
import { isEntityExists } from '../../../common/decorator/validation/isEntityExists';
import { ModelName } from '../../../common/enum/modelName.enum';
import { CharacterClass } from '../../characterClass.schema';

/**
 * Determines whenever the CharacterClass can be found from a DB or not based on the _id field.
 *
 * Notice that it can be used only for the _id field.
 *
 * This is a custom validation decorator,
 * which can be used in the same as other class-validator package's decorators.
 * @param validationOptions
 * @returns
 */
export function IsCharacterClassExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerValidationDecorator(
      IsCharacterClassExists.name,
      isCharacterClassExists,
      object,
      propertyName,
      validationOptions,
    );
  };
}

@ValidatorConstraint({ name: isCharacterClassExists.name, async: true })
@Injectable()
export class isCharacterClassExists
  extends isEntityExists<CharacterClass>
  implements ValidatorConstraintInterface
{
  public constructor(
    @InjectModel(ModelName.CHARACTER_CLASS)
    private readonly model: Model<CharacterClass>,
  ) {
    super(ModelName.CHARACTER_CLASS);
    super.setEntityModel(this.model);
  }
}
