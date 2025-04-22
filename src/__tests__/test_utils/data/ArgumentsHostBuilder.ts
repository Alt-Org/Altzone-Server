import { ArgumentsHost } from '@nestjs/common';
import {
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost,
} from '@nestjs/common/interfaces';

export default class ArgumentsHostBuilder {
  private readonly base: Partial<ArgumentsHost> = {
    getArgs: function () {
      return [] as any;
    },

    getArgByIndex: function (index: number) {
      return this.getArgs()[index];
    },

    switchToHttp: function () {
      return {
        getRequest: () => ({}),
        getResponse: () => ({}),
        getNext: () => ({}),
      } as HttpArgumentsHost;
    },

    switchToRpc: function () {
      return {
        getContext: () => ({}),
      } as RpcArgumentsHost;
    },

    switchToWs: function () {
      return {
        getClient: () => ({}),
        getData: () => ({}),
      } as WsArgumentsHost;
    },

    getType: function () {
      return 'http' as any;
    },
  };

  build(): ArgumentsHost {
    return { ...this.base } as ArgumentsHost;
  }

  setArgs(args: any[]) {
    this.base.getArgs = function () {
      return args as any;
    };
    return this;
  }

  setArgByIndex(index: number, arg: any) {
    const args = this.base.getArgs();
    args[index] = arg;
    this.base.getArgs = function () {
      return args as any;
    };
    return this;
  }

  setHttpRequest(request: any) {
    const baseSwitchToHttp = this.base.switchToHttp();

    this.base.switchToHttp = function () {
      return {
        ...baseSwitchToHttp,
        getRequest: () => request,
      };
    };
    return this;
  }

  setHttpResponse(response: any) {
    const baseSwitchToHttp = this.base.switchToHttp();

    this.base.switchToHttp = function () {
      return {
        ...baseSwitchToHttp,
        getResponse: () => response,
      };
    };
    return this;
  }

  setRpcContext(context: any) {
    this.base.switchToRpc = function () {
      return {
        getContext: () => context,
      } as RpcArgumentsHost;
    };
    return this;
  }

  setWsClient(client: any) {
    const baseSwitchToWs = this.base.switchToWs();

    this.base.switchToWs = function () {
      return {
        ...baseSwitchToWs,
        getClient: () => client,
      };
    };
    return this;
  }

  setWsData(data: any) {
    const baseSwitchToWs = this.base.switchToWs();

    this.base.switchToWs = function () {
      return {
        ...baseSwitchToWs,
        getData: () => data,
      };
    };
    return this;
  }

  setType(type: 'http' | 'rpc' | 'ws') {
    this.base.getType = function () {
      return type as any;
    };
    return this;
  }
}
