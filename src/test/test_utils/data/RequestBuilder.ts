import { Request } from 'express';

/**
 * Builder class for Express Request object
 */
export default class RequestBuilder {
    private readonly base: Partial<Request> = {
        body: {},
        params: {},
        query: {},
        headers: {},
        method: 'GET',
        url: '/',
        path: '/',
        protocol: 'http',
        secure: false,
        hostname: 'localhost',
        ip: '127.0.0.1',
        cookies: {},
    };

    build(): Request {
        return { ...this.base } as Request;
    }

    setBody(body: any) {
        this.base.body = body;
        return this;
    }

    setParams(params: any) {
        this.base.params = params;
        return this;
    }

    setQuery(query: any) {
        this.base.query = query;
        return this;
    }

    setHeaders(headers: any) {
        this.base.headers = headers;
        return this;
    }

    setMethod(method: string) {
        this.base.method = method;
        return this;
    }

    setUrl(url: string) {
        this.base.url = url;
        return this;
    }

    setPath(path: string) {
        this.base.path = path;
        return this;
    }

    setProtocol(protocol: 'http' | 'https') {
        this.base.protocol = protocol;
        return this;
    }

    setSecure(secure: boolean) {
        this.base.secure = secure;
        return this;
    }

    setHostname(hostname: string) {
        this.base.hostname = hostname;
        return this;
    }

    setIp(ip: string) {
        this.base.ip = ip;
        return this;
    }

    setCookies(cookies: any) {
        this.base.cookies = cookies;
        return this;
    }
}