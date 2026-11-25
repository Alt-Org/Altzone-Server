import 'reflect-metadata';
import { validate } from 'class-validator';
import { ChangeRoomPositionDto } from '../../../matchmaking/dto/changeRoomPosition.dto';
import { ToggleRoomBotDto } from '../../../matchmaking/dto/toggleRoomBot.dto';

describe.each([ChangeRoomPositionDto, ToggleRoomBotDto])('%p', (Dto) => {
  it.each([0, 1, 2, 3])('accepts slot %p', async (position) => {
    await expect(
      validate(Object.assign(new Dto(), { position })),
    ).resolves.toHaveLength(0);
  });

  it.each([undefined, null, '1', -1, 1.5, 4])(
    'rejects invalid slot %p',
    async (position) => {
      const errors = await validate(Object.assign(new Dto(), { position }));
      expect(errors).toEqual([
        expect.objectContaining({ property: 'position' }),
      ]);
    },
  );
});
