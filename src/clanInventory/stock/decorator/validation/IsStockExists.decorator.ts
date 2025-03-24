import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock } from '../../stock.schema';
import { isEntityExists } from '../../../../common/decorator/validation/isEntityExists';
import { registerValidationDecorator } from '../../../../common/decorator/validation/registerValidationDecorator';
import { ModelName } from '../../../../common/enum/modelName.enum';

export function IsStockExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string): void {
    registerValidationDecorator(
      IsStockExists.name,
      isStockExists,
      object,
      propertyName,
      validationOptions,
    );
  };
}

@ValidatorConstraint({ name: isStockExists.name, async: true })
@Injectable()
export class isStockExists
  extends isEntityExists<Stock>
  implements ValidatorConstraintInterface
{
  public constructor(
    @InjectModel(ModelName.STOCK) private readonly model: Model<Stock>,
  ) {
    super(ModelName.STOCK);
    super.setEntityModel(this.model);
  }
}
