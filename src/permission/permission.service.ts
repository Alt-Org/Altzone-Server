import { Injectable } from '@nestjs/common';
import {SystemAdminService} from "../common/apiState/systemAdmin.service";

@Injectable()
export class PermissionService {
    public constructor(private readonly systemAdminService: SystemAdminService) {
    }

    public makeSystemAdmin = async (input: any): Promise<boolean> => {
        return await this.systemAdminService.addSystemAdmin(input._id);
    }
    public removeSystemAdmin = async (input: any): Promise<boolean> => {
        return await this.systemAdminService.removeSystemAdmin(input._id);
    }
}
