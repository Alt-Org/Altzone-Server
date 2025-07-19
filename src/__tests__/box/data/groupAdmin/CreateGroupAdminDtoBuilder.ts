import { GroupAdmin } from '../../../../box/groupAdmin/groupAdmin.schema';
import { CreateGroupAdminDto } from '../../../../box/groupAdmin/dto/createGroupAdmin.dto';

export default class CreateGroupAdminDtoBuilder {
  private readonly base: CreateGroupAdminDto = {
    password: 'defaultPassword',
  };

  build(): GroupAdmin {
    return { ...this.base } as GroupAdmin;
  }

  setPassword(password: string) {
    this.base.password = password;
    return this;
  }
}
