import { Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin/demo/teaching')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('reset')
  async resetTeachingDemo(): Promise<void> {
    await this.adminService.resetTeachingDemo();
  }
}
