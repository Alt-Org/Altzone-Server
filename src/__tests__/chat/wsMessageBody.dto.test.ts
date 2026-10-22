import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WsMessageBodyDto } from '../../chat/dto/wsMessageBody.dto';
import { ChatEmotion } from '../../chat/enum/chatEmotion.enum';
import { ChatResponseType } from '../../chat/enum/chatResponseType.enum';

describe('WsMessageBodyDto', () => {
  const validateMessage = (message: object) =>
    validate(plainToInstance(WsMessageBodyDto, message));

  it('accepts a predefined response with an allowed emotion', async () => {
    await expect(
      validateMessage({
        responseType: ChatResponseType.NEED_COMPANY,
        emotion: ChatEmotion.BLANK,
      }),
    ).resolves.toHaveLength(0);
  });

  it.each([
    ['a missing response type', { emotion: ChatEmotion.JOY }],
    ['an invalid response type', { responseType: 'FreeText', emotion: 1 }],
    ['a missing emotion', { responseType: ChatResponseType.YES }],
    ['an invalid emotion', { responseType: ChatResponseType.YES, emotion: 99 }],
  ])('rejects %s', async (_, message) => {
    await expect(validateMessage(message)).resolves.not.toHaveLength(0);
  });
});
