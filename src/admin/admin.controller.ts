import { Controller, Post } from '@nestjs/common';
import { Action } from '../authorization/enum/action.enum';
import { AdminProfileDto } from './dto/AdminProfile.dto';
import { AdminService } from './admin.service';
import { Authorize } from '../authorization/decorator/Authorize';
import BasicService from '../common/service/basicService/BasicService';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';

@Controller('admin/demo/teaching')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly basicService: BasicService,
  ) {}

  @Post('reset')
  @Authorize({ action: Action.delete, subject: AdminProfileDto })
  public async resetTeachingDemo(@LoggedUser() user: User): Promise<void> {
    await this.adminService.resetTeachingDemo(user.profile_id);
  }
}
