import DailyTaskBuilder from './dailyTasks/DailyTaskBuilder';
import DailyTaskDtoBuilder from './dailyTasks/DailyTaskDtoBuilder';

type BuilderName = 'DailyTask' | 'DailyTaskDto';

type BuilderMap = {
  DailyTask: DailyTaskBuilder;
  DailyTaskDto: DailyTaskDtoBuilder;
};

export default class DailyTaskBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'DailyTask':
        return new DailyTaskBuilder() as BuilderMap[T];
      case 'DailyTaskDto':
        return new DailyTaskDtoBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
