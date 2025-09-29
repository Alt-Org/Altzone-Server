import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import EventEmitterService from './EventEmitter.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventEmitterCommonModule {}