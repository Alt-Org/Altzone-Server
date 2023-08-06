import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import {ApiStateModule} from "../common/apiState/apiState.module";

@Module({
  imports: [ ApiStateModule ],
  controllers: [ PermissionController ],
  providers: [ PermissionService ]
})
export class PermissionModule {}
