import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from './response.interceptor';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const messageKey =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse: ApiResponse<null> = {
      statusCode: status,
      meta: {
        success: false,
        message: messageKey,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
      body: null,
    };

    response.status(status).json(errorResponse);
  }
}
