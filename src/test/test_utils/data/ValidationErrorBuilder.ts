import { ValidationError } from 'class-validator';

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

    setConstraints(constraints: { [type: string]: string }) {
        this.base.constraints = constraints;
        return this;
    }

    addConstraint(type: string, message: string) {
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