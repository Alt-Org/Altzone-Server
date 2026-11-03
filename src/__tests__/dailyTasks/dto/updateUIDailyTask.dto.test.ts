import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UpdateUIDailyTaskDto } from '../../../dailyTasks/dto/updateUIDailyTask.dto';

describe('UpdateUIDailyTaskDto', () => {
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UpdateUIDailyTaskDto,
  };

  it('strips server-controlled isRewarded from client input', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true });

    const result = await pipe.transform(
      { amount: 1, isRewarded: true },
      metadata,
    );

    expect(result).toEqual({ amount: 1 });
    expect(result).not.toHaveProperty('isRewarded');
  });

  it('rejects progress amounts greater than one', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true });

    await expect(pipe.transform({ amount: 2 }, metadata)).rejects.toThrow();
  });
});
