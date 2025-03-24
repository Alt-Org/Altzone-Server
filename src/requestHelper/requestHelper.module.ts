import { Module } from '@nestjs/common';
import { RequestHelperService } from './requestHelper.service';

@Module({
  providers: [RequestHelperService],
  exports: [RequestHelperService],
})
export class RequestHelperModule {}
