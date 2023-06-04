import {
  Controller,
  Get,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { ErrorType } from '../errors/types/error-request.type';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transactions.schema';

@Controller('Transactions')
@SerializeOptions({
  excludePrefixes: ['_'],
})
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseInterceptors(MongooseClassSerializerInterceptor(Transaction))
  async transactions(): Promise<Transaction[] | ErrorType> {
    return await this.transactionsService.findAll();
  }
}
