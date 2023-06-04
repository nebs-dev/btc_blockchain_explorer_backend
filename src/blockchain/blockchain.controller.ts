import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainTransactionSubscribeRequestDto } from './dto/blockchain-transaction-subscribe-request.dto';
import { ErrorType } from '../errors/types/error-request.type';
import { BlockchainAddressSubscribeRequestDto } from './dto/blockchain-address-subscribe-request.dto';
import { AddressesService } from '../addresses/addresses.service';
import { TransactionsService } from '../transactions/transactions.service';
import { BlockchainTransactionSubscribeResponseDto } from './dto/blockchain-transaction-subscribe-response.dto';
import { BlockchainAddressSubscribeResponseDto } from './dto/blockchain-address-subscribe-response.dto';
import { AddressInfoType } from './types/address-info.type';
import { TransactionInfoType } from './types/transaction-info.type';
import { BlockchainAddressInfoRequestDto } from './dto/blockchain-address-info-request.dto';
import { BlockchainTransactionInfoRequestDto } from './dto/blockchain-transaction-info-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Types } from 'mongoose';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { Subscription } from '../subscriptions/subscriptions.schema';

@Controller('blockchain')
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly addressesService: AddressesService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('address')
  async getAddressInfo(
    @Query() data: BlockchainAddressInfoRequestDto,
  ): Promise<AddressInfoType | ErrorType> {
    const response = await this.blockchainService.getAddressBlockchainInfo(
      data.address,
    );
    await this.addressesService.createOneOrIncreaseCounter(data.address);
    return response;
  }

  @Get('transaction')
  async getTransactionInfo(
    @Query() data: BlockchainTransactionInfoRequestDto,
  ): Promise<TransactionInfoType | ErrorType> {
    const response = await this.blockchainService.getTransactionBlockchainInfo(
      data.hash,
    );
    await this.transactionsService.createOneOrIncreaseCounter(data.hash);
    return response;
  }

  @UseInterceptors(MongooseClassSerializerInterceptor(Subscription))
  @SerializeOptions({
    excludePrefixes: ['_'],
  })
  @UseGuards(AuthGuard)
  @Post('transaction/subscribe')
  async postTransactionSubscribe(
    @Body() data: BlockchainTransactionSubscribeRequestDto,
    @Request() req,
  ): Promise<BlockchainTransactionSubscribeResponseDto | ErrorType> {
    return await this.blockchainService.subscribeToTransaction(
      data.hash,
      new Types.ObjectId(req.user.userId),
    );
  }

  @UseGuards(AuthGuard)
  @Post('transaction/unsubscribe')
  async postUnsubscribeFromTransaction(
    @Body() data: BlockchainTransactionSubscribeRequestDto,
    @Request() req,
  ): Promise<boolean | ErrorType> {
    return await this.blockchainService.unsubscribeFromTransaction(
      data.hash,
      new Types.ObjectId(req.user.userId),
    );
  }

  @UseInterceptors(MongooseClassSerializerInterceptor(Subscription))
  @SerializeOptions({
    excludePrefixes: ['__'],
  })
  @UseGuards(AuthGuard)
  @Post('address/subscribe')
  async postAddressSubscribe(
    @Body() data: BlockchainAddressSubscribeRequestDto,
    @Request() req,
  ): Promise<BlockchainAddressSubscribeResponseDto | ErrorType> {
    return await this.blockchainService.subscribeToAddress(
      data.address,
      new Types.ObjectId(req.user.userId),
    );
  }

  @UseGuards(AuthGuard)
  @Post('address/unsubscribe')
  async postUnsubscribeFromAddress(
    @Body() data: BlockchainAddressSubscribeRequestDto,
    @Request() req,
  ): Promise<boolean | ErrorType> {
    return await this.blockchainService.unsubscribeFromAddress(
      data.address,
      new Types.ObjectId(req.user.userId),
    );
  }
}
