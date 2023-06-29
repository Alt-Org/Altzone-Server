import { Module } from '@nestjs/common';
import {ResponseHelperService} from "./responseHelper.service";

@Module({
    providers: [ResponseHelperService],
    exports: [ResponseHelperService]
})
export class ResponseHelperModule {}
