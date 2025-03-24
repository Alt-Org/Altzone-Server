import 'reflect-metadata';
import { plainToClass, instanceToInstance } from 'class-transformer';
import { ExtractField } from '../../../../common/decorator/response/ExtractField';
import { ObjectId } from 'mongodb';

describe('ExtractField() decorator test suite', () => {
  const expectedValue = new ObjectId('668a70ce91020196cb10d595');

  it('Should extract the field during serialization', () => {
    const mockObject = { _id: expectedValue };
    const instance = plainToClass(TestClass, mockObject);

    const result = instanceToInstance(instance);
    expect(result._id).toEqual(expectedValue);
  });

  it('Should handle nested objects correctly', () => {
    const nestedMockObject = { nestedField: { id: expectedValue } };
    const instance = plainToClass(NestedTestClass, nestedMockObject);

    const result = instanceToInstance(instance);
    expect(result.nestedField).toEqual({ id: expectedValue });
  });

  it('should handle missing fields gracefully', () => {
    const emptyMockObject = {};
    const instance = plainToClass(TestClass, emptyMockObject);

    const result = instanceToInstance(instance);
    expect(result._id).toBeUndefined();
  });
});

class TestClass {
  @ExtractField()
  public _id: string;

  constructor(_id: string) {
    this._id = _id;
  }
}

class NestedTestClass {
  @ExtractField()
  public nestedField: { id: string };

  constructor(nestedField: { id: string }) {
    this.nestedField = nestedField;
  }
}
