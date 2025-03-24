import { CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';

export default class CallHandlerBuilder {
  private readonly base: Partial<CallHandler> = {
    handle: function (): Observable<any> {
      return of(null);
    },
  };

  build(): CallHandler {
    return { ...this.base } as CallHandler;
  }

  setHandleResponse(response: any) {
    this.base.handle = function (): Observable<any> {
      return of(response);
    };
    return this;
  }

  setHandle(handlerFunction: () => Observable<any>) {
    this.base.handle = handlerFunction;
    return this;
  }
}
