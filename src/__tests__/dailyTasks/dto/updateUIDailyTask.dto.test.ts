import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UpdateUIDailyTaskDto } from '../../../dailyTasks/dto/updateUIDailyTask.dto';
import { ObjectId } from 'mongodb';

describe('UpdateUIDailyTaskDto', () => {
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: UpdateUIDailyTaskDto,
  };

  it('strips server-controlled isRewarded from client input', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true });
    const taskId = new ObjectId().toString();

    const result = await pipe.transform(
      { taskId, amount: 1, isRewarded: true },
      metadata,
    );

    expect(result).toEqual({ taskId, amount: 1 });
    expect(result).not.toHaveProperty('isRewarded');
  });

  it('rejects progress amounts greater than one', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true });

    await expect(
      pipe.transform(
        { taskId: new ObjectId().toString(), amount: 2 },
        metadata,
      ),
    ).rejects.toThrow();
  });

  it('requires a valid task instance ID', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true });

    await expect(pipe.transform({ amount: 1 }, metadata)).rejects.toThrow();
    await expect(
      pipe.transform({ taskId: 'not-an-object-id', amount: 1 }, metadata),
    ).rejects.toThrow();
  });
});
