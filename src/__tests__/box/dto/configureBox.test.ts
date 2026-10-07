import { validate } from 'class-validator';
import { ConfigureBoxDto } from '../../../box/dto/configureBox.dto';
import {
  BOX_SESSION_MAX_PARTICIPANTS,
  BOX_SESSION_MIN_PARTICIPANTS,
} from '../../../box/consts/boxSessionConstants';

describe('ConfigureBoxDto', () => {
  const createDto = (testersAmount?: number) => {
    const dto = new ConfigureBoxDto();
    dto.testersAmount = testersAmount;
    return dto;
  };

  it.each([BOX_SESSION_MIN_PARTICIPANTS, BOX_SESSION_MAX_PARTICIPANTS])(
    'accepts %i participants',
    async (testersAmount) => {
      await expect(validate(createDto(testersAmount))).resolves.toHaveLength(0);
    },
  );

  it('allows testersAmount to be omitted', async () => {
    await expect(validate(createDto())).resolves.toHaveLength(0);
  });

  it.each([0, -1, BOX_SESSION_MAX_PARTICIPANTS + 1])(
    'rejects an out-of-range participant count of %i',
    async (testersAmount) => {
      const errors = await validate(createDto(testersAmount));

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('testersAmount');
    },
  );

  it('rejects a non-integer participant count', async () => {
    const errors = await validate(createDto(1.5));

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
});
