import DailyTaskBuilder from './dailyTasks/DailyTaskBuilder';

type BuilderName = 'DailyTask';

type BuilderMap = {
  DailyTask: DailyTaskBuilder;
};

export default class DailyTaskBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'DailyTask':
        return new DailyTaskBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
