import { Module } from '@nestjs/common';
import {SystemAdminService} from "./systemAdmin.service";

@Module({
    providers: [ SystemAdminService ],
    exports: [ SystemAdminService ]
})
export class ApiStateModule {}
