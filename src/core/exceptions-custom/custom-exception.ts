import {BadRequestException, HttpStatus, NotFoundException} from '@nestjs/common';

export class CustomException extends BadRequestException {
  constructor(message: string) {
    super({
      status: HttpStatus.BAD_REQUEST,
      message: message,
    });
  }
}

export class CustomNotFoundException extends NotFoundException {
  constructor(message: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      message: message,
    });
  }
}
