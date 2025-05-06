import 'reflect-metadata';
import { validate } from 'class-validator';
import { IsMongoIdOrNull } from '../../../../../common/decorator/validation/IsMongoIdOrNull.decorator';

describe('@IsMongoIdOrNull() test suite', () => {
  let dto: TestDto;
  let objectId: string;
  beforeEach(async () => {
    dto = new TestDto();
    objectId = '6814a2ae8cbeb9b0dcd086bd';
  });

  it('Should pass validation for null and mongo Id input', async () => {
    dto.ids = [null, objectId];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with empty array', async () => {
    const dto = new TestDto();
    dto.ids = [];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with a single mongo id input', async () => {
    const dto = new TestDto();
    dto.ids = objectId;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with null input', async () => {
    const dto = new TestDto();
    dto.ids = null;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should pass validation with an mongo id input (array)', async () => {
    const dto = new TestDto();
    dto.ids = [objectId];

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
    dto.ids = [objectId, objectId, objectId];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('Should fail validation with invalid mongo id input', async () => {
    const dto = new TestDto();
    dto.ids = ['invalid', objectId, objectId];

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.IsMongoIdOrNullConstraint).toBe(
      'ids must be a mongodb id or null',
    );
  });
});

class TestDto {
  @IsMongoIdOrNull({ each: true })
  ids: any;
}
