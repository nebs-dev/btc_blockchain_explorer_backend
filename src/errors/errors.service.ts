import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { ErrorType } from './types/error-request.type';

@Injectable()
export class ErrorsService {
  public handleRequestError(error: AxiosError | Error): ErrorType {
    if (error instanceof AxiosError) {
      const axiosResponse = error.response as AxiosResponse;
      const errorMessage = axiosResponse.data.error;

      throw new BadRequestException(errorMessage, {
        description: 'We were unable to process your request',
      });
    }

    throw new InternalServerErrorException('An unexpected error occurred.', {
      description: 'Internal Server Error',
    });
  }

  public handleSubscriptionTransactionError(transactionId): ErrorType {
    throw new InternalServerErrorException(
      `Unable to subscribe to the transaction ${transactionId}.`,
      {
        description: 'Internal Server Error',
      },
    );
  }

  public handleSubscriptionAddressError(address: string): ErrorType {
    throw new InternalServerErrorException(
      `Unable to subscribe to the address ${address}.`,
      {
        description: 'Internal Server Error',
      },
    );
  }

  public handleNotFoundError(identifier: string, model: string): ErrorType {
    throw new NotFoundException(`Not found ${model} ${identifier}.`, {
      description: 'Not Found Error',
    });
  }
}
