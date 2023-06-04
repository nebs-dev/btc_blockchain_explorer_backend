import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { EventsGateway } from '../events/events.gateway';
import { ErrorsService } from '../errors/errors.service';
import { ErrorType } from '../errors/types/error-request.type';
import { Subscription } from '../subscriptions/subscriptions.schema';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AddressInfoType } from './types/address-info.type';
import { TransactionInfoType } from './types/transaction-info.type';
import { Types } from 'mongoose';
import { TransactionsService } from '../transactions/transactions.service';
import { AddressesService } from '../addresses/addresses.service';

@Injectable()
export class BlockchainService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
    private readonly errorsService: ErrorsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly transactionsService: TransactionsService,
    private readonly addressesService: AddressesService,
  ) {}

  private getBlockCypherBaseUrl(): string {
    // Retrieve the BlockCypher base URL from your configuration
    return this.configService.get<string>('blockcypher.baseUrl');
  }

  private getBlockCypherApiKey(): string {
    // Retrieve the BlockCypher API key from your configuration
    return this.configService.get<string>('blockcypher.apiKey');
  }

  public async getAddressBlockchainInfo(
    address: string,
  ): Promise<AddressInfoType | ErrorType> {
    try {
      const baseUrl = this.getBlockCypherBaseUrl();
      const url = `${baseUrl}/addrs/${address}/balance`;

      const response = await lastValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      return this.errorsService.handleRequestError(error);
    }
  }

  public async getTransactionBlockchainInfo(
    transactionId: string,
  ): Promise<TransactionInfoType | ErrorType> {
    try {
      const baseUrl = this.getBlockCypherBaseUrl();
      const url = `${baseUrl}/txs/${transactionId}`;

      const response = await lastValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      return this.errorsService.handleRequestError(error);
    }
  }

  public async subscribeToTransaction(
    hash: string,
    userId: Types.ObjectId,
  ): Promise<Subscription | ErrorType> {
    try {
      // Create subscribe event on the gateway
      this.eventsGateway.subscribeToTransactionOrAddress({ hash });
    } catch (error) {
      console.log('SUBSCRIPTION TRANSACTION ERROR:', error);
      return this.errorsService.handleSubscriptionTransactionError(hash);
    }

    let transaction = null;

    // Check if the transaction already exists
    const transactionExists = await this.transactionsService.findOneByHash(
      hash,
    );

    if (transactionExists) {
      transaction = transactionExists;
    } else {
      transaction = await this.transactionsService.createOneOrIncreaseCounter(
        hash,
      );
    }

    // Check if the subscription already exists
    const subscription =
      await this.subscriptionsService.findOneByTransactionHash(transaction);

    if (subscription) {
      return subscription;
    } else {
      const subscription = await this.subscriptionsService.createOne({
        userId,
        transaction,
      });

      return subscription;
    }
  }

  public async subscribeToAddress(
    address: string,
    userId: Types.ObjectId,
  ): Promise<Subscription | ErrorType> {
    try {
      // Create subscribe event on the gateway
      this.eventsGateway.subscribeToTransactionOrAddress({ address });
    } catch (error) {
      console.log('SUBSCRIPTION TRANSACTION ERROR:', error);
      return this.errorsService.handleSubscriptionAddressError(address);
    }

    // Check if the address already exists
    const addressExists = await this.addressesService.findOneByAddress(address);

    let addressObj = null;
    if (addressExists) {
      addressObj = addressExists;
    } else {
      addressObj = await this.addressesService.createOneOrIncreaseCounter(
        address,
      );
    }

    // Check if the subscription already exists
    const subscription = await this.subscriptionsService.findOneByAddress(
      addressObj,
    );

    if (subscription) {
      return subscription;
    } else {
      const subscription = await this.subscriptionsService.createOne({
        userId,
        address: addressObj,
      });

      return subscription;
    }
  }

  public async unsubscribeFromTransaction(
    hash: string,
    userId: Types.ObjectId,
  ): Promise<boolean | ErrorType> {
    // Check if the transaction already exists
    const transaction = await this.transactionsService.findOneByHash(hash);

    if (!transaction) {
      return true;
    }

    try {
      await this.subscriptionsService.deleteOneByTransactionIdAndUserId(
        new Types.ObjectId(transaction._id),
        userId,
      );

      return true;
    } catch (error) {
      console.log('UNSUBSCRIPTION TRANSACTION ERROR:', error);
      return false;
    }
  }

  public async unsubscribeFromAddress(
    address: string,
    userId: Types.ObjectId,
  ): Promise<boolean | ErrorType> {
    // Check if the transaction already exists
    const addressObj = await this.addressesService.findOneByAddress(address);

    if (!addressObj) {
      return true;
    }

    try {
      await this.subscriptionsService.deleteOneByAddressIdAndUserId(
        new Types.ObjectId(addressObj._id),
        userId,
      );

      return true;
    } catch (error) {
      console.log('UNSUBSCRIPTION ADDRESS ERROR:', error);
      return false;
    }
  }
}
