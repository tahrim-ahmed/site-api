import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ResponseDto } from '../dto/response/response.dto';
import { SystemErrorDto } from '../dto/response/system-error.dto';
import { ErrorDto } from '../dto/response/error.dto';

@Catch(HttpException)
export class SystemExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SystemExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const now = Date.now();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const processTime = exception['processTime'] || '0';
    const context = exception['context'] || '-/-';
    const { method, socket, url } = request;
    const { remoteAddress } = socket;

    const status = exception
      ? exception.getStatus()
      : <number>HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception.message || 'Internal error';

    this.logger.error({
      remoteIP: `${remoteAddress}`,
      method: `${method}`,
      processTime: `${processTime}`,
      statusCode: status,
      url: `${url}`,
      context: `${context}`,
      message: `${JSON.stringify(exception.getResponse())}`,
    });

    let responseDto = exception.getResponse() as ResponseDto;

    if (!responseDto) {
      const systemErrorDto = new SystemErrorDto('url', `${url}`, `${message}`);
      const errorDto = new ErrorDto(null, systemErrorDto);
      responseDto = new ResponseDto(now, status, 'Error', errorDto, null);
    }

    response.status(status).json(responseDto);
  }
}
