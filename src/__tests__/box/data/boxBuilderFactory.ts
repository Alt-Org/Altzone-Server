import BoxBuilder from './box/BoxBuilder';
import CreateBoxDtoBuilder from './box/CreateBoxDtoBuilder';
import UpdateBoxDtoBuilder from './box/UpdateBoxDtoBuilder';
import GroupAdminBuilder from './groupAdmin/GroupAdminBuilder';
import TesterBuilder from './box/TesterBuilder';
import BoxUserBuilder from './box/BoxUserBuilder';
import CreateDailyTaskBuilder from './dailyTask/CreateDailyTaskBuilder';
import CreatePredefinedDailyTaskDtoBuilder from './dailyTask/CreatePredefinedDailyTaskDtoBuilder';
import UpdatePredefinedDailyTaskDtoBuilder from './dailyTask/UpdatePredefinedDailyTaskDtoBuilder';
import PredefinedDailyTaskBuilder from './dailyTask/PredefinedDailyTaskBuilder';
import CreateGroupAdminDtoBuilder from './groupAdmin/CreateGroupAdminDtoBuilder';

type BuilderName =
  | 'Box'
  | 'CreateBoxDto'
  | 'UpdateBoxDto'
  | 'GroupAdmin'
  | 'CreateGroupAdminDto'
  | 'Tester'
  | 'BoxUser'
  | 'CreateDailyTask'
  | 'CreatePredefinedDailyTaskDto'
  | 'UpdatePredefinedDailyTaskDto'
  | 'PredefinedDailyTask';

type BuilderMap = {
  Box: BoxBuilder;
  CreateBoxDto: CreateBoxDtoBuilder;
  UpdateBoxDto: UpdateBoxDtoBuilder;
  GroupAdmin: GroupAdminBuilder;
  CreateGroupAdminDto: CreateGroupAdminDtoBuilder;
  Tester: TesterBuilder;
  BoxUser: BoxUserBuilder;

  CreateDailyTask: CreateDailyTaskBuilder;
  CreatePredefinedDailyTaskDto: CreatePredefinedDailyTaskDtoBuilder;
  UpdatePredefinedDailyTaskDto: UpdatePredefinedDailyTaskDtoBuilder;
  PredefinedDailyTask: PredefinedDailyTaskBuilder;
};

export default class BoxBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'Box':
        return new BoxBuilder() as BuilderMap[T];
      case 'CreateBoxDto':
        return new CreateBoxDtoBuilder() as BuilderMap[T];
      case 'UpdateBoxDto':
        return new UpdateBoxDtoBuilder() as BuilderMap[T];
      case 'GroupAdmin':
        return new GroupAdminBuilder() as BuilderMap[T];
      case 'CreateGroupAdminDto':
        return new CreateGroupAdminDtoBuilder() as BuilderMap[T];
      case 'Tester':
        return new TesterBuilder() as BuilderMap[T];
      case 'BoxUser':
        return new BoxUserBuilder() as BuilderMap[T];
      case 'CreateDailyTask':
        return new CreateDailyTaskBuilder() as BuilderMap[T];
      case 'CreatePredefinedDailyTaskDto':
        return new CreatePredefinedDailyTaskDtoBuilder() as BuilderMap[T];
      case 'UpdatePredefinedDailyTaskDto':
        return new UpdatePredefinedDailyTaskDtoBuilder() as BuilderMap[T];
      case 'PredefinedDailyTask':
        return new PredefinedDailyTaskBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
