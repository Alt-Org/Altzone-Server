import { BadRequestException, HttpStatus } from '@nestjs/common';

export default class BadRequestExceptionBuilder {
  private readonly base: { response: string | object; status: number } = {
    response: 'Bad Request',
    status: HttpStatus.BAD_REQUEST,
  };

  build(): BadRequestException {
    return new BadRequestException(this.base.response);
  }

  setResponse(response: string | object) {
    this.base.response = response;
    return this;
  }

  setMessage(message: string) {
    this.base.response = { message };
    return this;
  }
}
