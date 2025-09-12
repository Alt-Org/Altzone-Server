import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RequestLog } from './RequestLog.schema';
import { Model } from 'mongoose';

@Injectable()
export class RequestLoggerService {
  constructor(
    @InjectModel(RequestLog.name) private requestLogModel: Model<RequestLog>,
  ) {}

  /**
   * Logs a request by sanitizing its body and storing it in the database.
   */
  async log(data: Partial<RequestLog>) {
    data.body = this.sanitizeBody(data.body);
    await this.requestLogModel.create(data);
  }

  /**
   * Sanitizes the provided request body by redacting any fields containing the word "password".
   */
  private sanitizeBody(body: any): any {
    if (typeof body !== 'object' || body === null) return body;
    const sanitized: any = {};
    for (const key of Object.keys(body)) {
      if (key.toLowerCase().includes('password')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = body[key];
      }
    }

    return sanitized;
  }
}
