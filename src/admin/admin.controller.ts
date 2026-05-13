import { Controller, Post } from '@nestjs/common';
import { Action } from '../authorization/enum/action.enum';
import { AdminProfileDto } from './dto/AdminProfile.dto';
import { AdminService } from './admin.service';
import { Authorize } from 'src/authorization/decorator/Authorize';
import BasicService from 'src/common/service/basicService/BasicService';
import { LoggedUser } from 'src/common/decorator/param/LoggedUser.decorator';
import { SEReason } from 'src/common/service/basicService/SEReason';
import ServiceError from 'src/common/service/basicService/ServiceError';
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
    const { profile_id } = user;
    const [profile, profileErrors] =
      await this.basicService.readOneById<AdminProfileDto>(profile_id);

    if (profileErrors) {
      throw profileErrors;
    }

    if (!profile.isSystemAdmin) {
      throw new ServiceError({
        reason: SEReason.NOT_AUTHORIZED,
        value: 403,
        message: 'Only system admins can manually erase teaching demo data.',
      });
    }

    await this.adminService.resetTeachingDemo();
  }
}
