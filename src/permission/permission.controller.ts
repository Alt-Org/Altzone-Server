import {Body, Controller, Put} from '@nestjs/common';
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";
import {UpdateProfileDto} from "../profile/dto/updateProfile.dto";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {PermissionService} from "./permission.service";
import {UpdateSystemAdminDto} from "./dto/UpdateSystemAdmin.dto";

@Controller('permission')
export class PermissionController {
    public constructor(private readonly service: PermissionService) {
    }
    @Put('/systemAdmin')
    @Authorize({action: Action.update, subject: UpdateProfileDto})
    @BasicPUT(ModelName.PROFILE)
    public systemAdmin(@Body() body: UpdateSystemAdminDto){
        if(body.isSystemAdmin)
            return this.service.makeSystemAdmin(body);
        else
            return this.service.removeSystemAdmin(body);
    }
}
