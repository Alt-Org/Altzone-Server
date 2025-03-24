import { ValidationError } from 'class-validator';

type Constraint =
  | 'min'
  | 'arrayMinSize'
  | 'minDate'
  | 'minLength'
  | 'arrayNotEmpty'
  | 'isNotEmptyObject'
  | 'max'
  | 'arrayMaxSize'
  | 'maxLength'
  | 'isNumber'
  | 'isInt'
  | 'isString'
  | 'notObject'
  | 'notDate'
  | 'isArray'
  | 'isBoolean'
  | 'isEnum';

export default class ValidationErrorBuilder {
  private readonly base: Partial<ValidationError> = {
    property: '',
    constraints: {},
    children: [],
  };

  build(): ValidationError {
    const error = new ValidationError();
    error.property = this.base.property!;
    error.constraints = this.base.constraints!;
    error.children = this.base.children!;
    error.value = this.base.value;
    return error;
  }

  setProperty(property: string) {
    this.base.property = property;
    return this;
  }

  setConstraints(constraints: { Constraint: string }) {
    this.base.constraints = constraints;
    return this;
  }

  addConstraint(type: Constraint, message: string) {
    if (!this.base.constraints) {
      this.base.constraints = {};
    }
    this.base.constraints[type] = message;
    return this;
  }

  setChildren(children: ValidationError[]) {
    this.base.children = children;
    return this;
  }

  addChild(child: ValidationError) {
    if (!this.base.children) {
      this.base.children = [];
    }
    this.base.children.push(child);
    return this;
  }

  setValue(value: any) {
    this.base.value = value;
    return this;
  }
}
