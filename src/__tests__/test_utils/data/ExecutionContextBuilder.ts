import { ExecutionContext } from '@nestjs/common';
import { ContextType, HttpArgumentsHost, RpcArgumentsHost, Type, WsArgumentsHost } from '@nestjs/common/interfaces';

export default class ExecutionContextBuilder {
    private readonly base: Partial<ExecutionContext> = {
        switchToHttp: function () {
            return {
                getRequest: () => ({}),
                getResponse: () => ({}),
                getNext: () => ({}),
            } as HttpArgumentsHost;
        },

        switchToRpc: function () {
            return {
                getData: () => ({}),
                getContext: () => ({}),
            } as RpcArgumentsHost;
        },

        switchToWs: function () {
            return {
                getClient: () => ({}),
                getData: () => ({}),
            } as WsArgumentsHost;
        },

        //@ts-expect-error: The base object is a Partial<ExecutionContext>, so some methods may not fully match the ExecutionContext interface.
        getType: function () {
            return 'http';
        },

        getClass: function () {
            return class {} as Type;
        },

        getHandler: function () {
            return function () {};
        },
    };

    build(): ExecutionContext {
        return { ...this.base } as ExecutionContext;
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
                getResponse: () => response
            };
        };
        return this;
    }

    setRpcContext(context: any) {
        const baseSwitchToRpc = this.base.switchToRpc();
        this.base.switchToRpc = function () {
            return {
                ...baseSwitchToRpc,
                getContext: () => context,
            } as RpcArgumentsHost
        };
        return this;
    }

    setRpcData(data: any) {
        const baseSwitchToRpc = this.base.switchToRpc();
        this.base.switchToRpc = function () {
            return {
                ...baseSwitchToRpc,
                getData: () => data,
            } as RpcArgumentsHost
        };
        return this;
    }

    setWsClient(client: any) {
        const baseSwitchToWs= this.base.switchToWs();
        this.base.switchToWs = function () {
            return {
                ...baseSwitchToWs,
                getClient: () => client
            }  as WsArgumentsHost;
        };
        return this;
    }

    setWsData(data: any) {
        const baseSwitchToWs= this.base.switchToWs();
        this.base.switchToWs = function () {
            return {
                ...baseSwitchToWs,
                getData: () => data,
            };
        };
        return this;
    }

    setType(type: ContextType) {
        //@ts-expect-error: The base object is a Partial<ExecutionContext>, so assigning a new getType method may not fully match the ExecutionContext interface.
        this.base.getType = function () {
            return type;
        };
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    setHandler(handler: Function) {
        this.base.getHandler = function () {
            return handler;
        };
        return this;
    }

    setClass(classType: any) {
        this.base.getClass = function () {
            return classType;
        };
        return this;
    }
}