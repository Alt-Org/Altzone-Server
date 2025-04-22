import { Expose } from 'class-transformer';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { ServerTaskName } from '../enum/serverTaskName.enum';
import AddType from '../../common/base/decorator/AddType.decorator';
import { TaskTitle } from '../type/taskTitle.type';
import { UITaskName } from '../enum/uiTaskName.enum';

@AddType('DailyTaskDto')
export class DailyTaskDto {
  @ExtractField()
  @Expose()
  _id: string;

  @ExtractField()
  @Expose()
  clan_id: string;

  @ExtractField()
  @Expose()
  player_id: string;

  @Expose()
  title: TaskTitle;

  @Expose()
  type: ServerTaskName | UITaskName;

  @Expose()
  points: number;

  @Expose()
  coins: number;

  @Expose()
  startedAt: Date;

  @Expose()
  amount: number;

  @Expose()
  amountLeft: number;

  @Expose()
  timeLimitMinutes: number;
}
