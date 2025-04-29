import 'reflect-metadata';
import { validate } from 'class-validator';
import { IsMongoIdOrNull } from '../../../../../common/decorator/validation/IsMongoIdOrNull.decorator';
import { ObjectId } from 'mongodb';

describe('@IsMongoIdOrNull() test suite', () => {
  it('Should pass validation for null and mongo Id input', async () => {
    const dto = new TestDto();
    dto.ids = [null, new ObjectId()];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation without any inputs', async () => {
    const dto = new TestDto();
    dto.ids = [];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with a single mongo id input', async () => {
    const dto = new TestDto();
    dto.ids = new ObjectId();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with a single null input', async () => {
    const dto = new TestDto();
    dto.ids = null;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with an mongo id input (array)', async () => {
    const dto = new TestDto();
    dto.ids = [new ObjectId()];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with null input (array)', async () => {
    const dto = new TestDto();
    dto.ids = [null];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with more null inputs', async () => {
    const dto = new TestDto();
    dto.ids = [null, null, null];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with more mongo id input', async () => {
    const dto = new TestDto();
    dto.ids = [new ObjectId(), new ObjectId(), new ObjectId()];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should fail validation with invalid and more valid mongo id input', async () => {
    const dto = new TestDto();
    dto.ids = ['invalid', new ObjectId(), new ObjectId()];

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.IsMongoIdOrNullConstraint).toBe(
      'ids must be a mongodb id or null',
    );
  });

  it('Should fail validation with invalid, valid mongo id and null input', async () => {
    const dto = new TestDto();
    dto.ids = ['invalid', new ObjectId(), null];

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.IsMongoIdOrNullConstraint).toBe(
      'ids must be a mongodb id or null',
    );
  });
});

class TestDto {
  @IsMongoIdOrNull()
  ids: any;
}
