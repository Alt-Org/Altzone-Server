import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestLog, RequestLogSchema } from './RequestLog.schema';
import { RequestLoggerService } from './RequestLogger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestLog.name, schema: RequestLogSchema },
    ]),
  ],
  providers: [RequestLoggerService],
  exports: [RequestLoggerService],
})
export class LoggerModule {}
