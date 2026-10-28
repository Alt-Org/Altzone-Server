import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FleaMarketAdPosterDto } from '../../../../fleaMarket/stall/dto/adPoster.dto';

describe('FleaMarketAdPosterDto test suite', () => {
  it('should accept a valid nested text field', async () => {
    const dto = plainToInstance(FleaMarketAdPosterDto, {
      textField: {
        textString: 'Christmas table',
        textFont: 'Helvetica.ttf',
        textColour: '#FFFFFF',
        textPosition: [0, 10, 0, 10],
      },
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('should accept a partial nested text field update', async () => {
    const dto = plainToInstance(FleaMarketAdPosterDto, {
      textField: { textString: '' },
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([[[0, 10, 0]], [[0, 10, 0, 10, 20]], [[0, 10, 'invalid', 10]]])(
    'should reject an invalid text position: %p',
    async (textPosition) => {
      const dto = plainToInstance(FleaMarketAdPosterDto, {
        textField: { textPosition },
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('textField');
    },
  );
});
