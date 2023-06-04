import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { BlockchainService } from './blockchain.service';
import { ErrorsService } from '../errors/errors.service';
import { EventsGateway } from '../events/events.gateway';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AddressesService } from '../addresses/addresses.service';
import { getApp } from '../../test/setup';

describe('BlockchainService', () => {
  let blockchainService: BlockchainService;
  let httpService: HttpService;
  let configService: ConfigService;
  let eventsGateway: EventsGateway;
  let errorsService: ErrorsService;
  let subscriptionsService: SubscriptionsService;
  let transactionsService: TransactionsService;
  let addressesService: AddressesService;

  beforeEach(async () => {
    const app = getApp();
    subscriptionsService = app.get<SubscriptionsService>(SubscriptionsService);
    transactionsService = app.get<TransactionsService>(TransactionsService);
    addressesService = app.get<AddressesService>(AddressesService);
    eventsGateway = app.get<EventsGateway>(EventsGateway);
    blockchainService = app.get<BlockchainService>(BlockchainService);
    errorsService = app.get<ErrorsService>(ErrorsService);
  });

  describe('subscribeToTransaction', () => {
    it('should create a subscription to a transaction', async () => {
      // Mock the required dependencies and data
      const hash = 'sample_hash';
      const userId = new Types.ObjectId();
      const transaction = {
        _id: new Types.ObjectId(),
        hash: 'sample_hash',
        counter: 0,
      };
      const subscription = {
        _id: new Types.ObjectId(),
        user: {
          _id: userId,
          name: 'sample_name',
          email: 'sample_email',
          passwordHash: 'sample_password_hash',
        },
        transaction,
        address: null,
      };
      jest
        .spyOn(eventsGateway, 'subscribeToTransactionOrAddress')
        .mockImplementation();
      jest
        .spyOn(transactionsService, 'findOneByHash')
        .mockResolvedValue(transaction);
      jest
        .spyOn(subscriptionsService, 'findOneByTransactionHash')
        .mockResolvedValue(null);
      jest
        .spyOn(subscriptionsService, 'createOne')
        .mockResolvedValue(subscription);

      const result = await blockchainService.subscribeToTransaction(
        hash,
        userId,
      );

      expect(
        eventsGateway.subscribeToTransactionOrAddress,
      ).toHaveBeenCalledWith({ hash });
      expect(transactionsService.findOneByHash).toHaveBeenCalledWith(hash);
      expect(
        subscriptionsService.findOneByTransactionHash,
      ).toHaveBeenCalledWith(transaction);
      expect(subscriptionsService.createOne).toHaveBeenCalledWith({
        userId,
        transaction,
      });
      expect(result).toBe(subscription);
    });

    it('should return the existing subscription if it already exists', async () => {
      // Mock the required dependencies and data
      const hash = 'sample_hash';
      const userId = new Types.ObjectId();
      const transaction = { _id: new Types.ObjectId(), hash, counter: 0 };
      const subscription = {
        _id: new Types.ObjectId(),
        user: {
          _id: userId,
          name: 'sample_name',
          email: 'sample_email',
          passwordHash: 'sample_password_hash',
        },
        transaction: transaction,
        address: null,
      };
      jest
        .spyOn(eventsGateway, 'subscribeToTransactionOrAddress')
        .mockImplementation();
      jest
        .spyOn(transactionsService, 'findOneByHash')
        .mockResolvedValue(transaction);
      jest
        .spyOn(subscriptionsService, 'findOneByTransactionHash')
        .mockResolvedValue(subscription);
      jest.spyOn(subscriptionsService, 'createOne').mockResolvedValue(null);

      const result = await blockchainService.subscribeToTransaction(
        hash,
        userId,
      );

      expect(
        eventsGateway.subscribeToTransactionOrAddress,
      ).toHaveBeenCalledWith({ hash });
      expect(transactionsService.findOneByHash).toHaveBeenCalledWith(hash);
      expect(
        subscriptionsService.findOneByTransactionHash,
      ).toHaveBeenCalledWith(transaction);
      expect(result).toBe(subscription);
    });
  });

  describe('subscribeToAddress', () => {
    it('should create a subscription to an address', async () => {
      // Mock the required dependencies and data
      const address = 'sample_address';
      const userId = new Types.ObjectId();
      const addressObj = {
        _id: new Types.ObjectId(),
        address: 'sample_address',
        counter: 0,
      };
      const subscription = {
        _id: new Types.ObjectId(),
        user: {
          _id: userId,
          name: 'sample_name',
          email: 'sample_email',
          passwordHash: 'sample_password_hash',
        },
        transaction: null,
        address: addressObj,
      };
      jest
        .spyOn(eventsGateway, 'subscribeToTransactionOrAddress')
        .mockImplementation();
      jest
        .spyOn(addressesService, 'findOneByAddress')
        .mockResolvedValue(addressObj);
      jest
        .spyOn(subscriptionsService, 'findOneByAddress')
        .mockResolvedValue(null);
      jest
        .spyOn(subscriptionsService, 'createOne')
        .mockResolvedValue(subscription);

      const result = await blockchainService.subscribeToAddress(
        address,
        userId,
      );

      expect(
        eventsGateway.subscribeToTransactionOrAddress,
      ).toHaveBeenCalledWith({ address });
      expect(addressesService.findOneByAddress).toHaveBeenCalledWith(address);
      expect(subscriptionsService.findOneByAddress).toHaveBeenCalledWith(
        addressObj,
      );
      expect(subscriptionsService.createOne).toHaveBeenCalledWith({
        userId,
        address: addressObj,
      });
      expect(result).toBe(subscription);
    });

    it('should return the existing subscription if it already exists', async () => {
      // Mock the required dependencies and data
      const address = 'sample_address';
      const userId = new Types.ObjectId();
      const addressObj = {
        _id: new Types.ObjectId(),
        address: 'sample_address',
        counter: 0,
      };
      const subscription = {
        _id: new Types.ObjectId(),
        user: {
          _id: userId,
          name: 'sample_name',
          email: 'sample_email',
          passwordHash: 'sample_password_hash',
        },
        transaction: null,
        address: addressObj,
      };
      jest
        .spyOn(eventsGateway, 'subscribeToTransactionOrAddress')
        .mockImplementation();
      jest
        .spyOn(addressesService, 'findOneByAddress')
        .mockResolvedValue(addressObj);
      jest
        .spyOn(subscriptionsService, 'findOneByAddress')
        .mockResolvedValue(subscription);
      jest.spyOn(subscriptionsService, 'createOne').mockResolvedValue(null);

      const result = await blockchainService.subscribeToAddress(
        address,
        userId,
      );

      expect(
        eventsGateway.subscribeToTransactionOrAddress,
      ).toHaveBeenCalledWith({ address });
      expect(addressesService.findOneByAddress).toHaveBeenCalledWith(address);
      expect(subscriptionsService.findOneByAddress).toHaveBeenCalledWith(
        addressObj,
      );
      expect(result).toBe(subscription);
    });
  });

  describe('unsubscribeFromTransaction', () => {
    it('should unsubscribe from a transaction', async () => {
      // Mock the required dependencies and data
      const hash = 'sample_hash';
      const userId = new Types.ObjectId();
      const transaction = { _id: new Types.ObjectId(), hash, counter: 0 };
      const subscription = {
        _id: new Types.ObjectId(),
        user: {
          _id: userId,
          name: 'sample_name',
          email: 'sample_email',
          passwordHash: 'sample_password_hash',
        },
        transaction: transaction,
        address: null,
      };

      jest
        .spyOn(transactionsService, 'findOneByHash')
        .mockResolvedValue(transaction);
      jest
        .spyOn(subscriptionsService, 'findOneByTransactionHash')
        .mockResolvedValue(subscription);

      const result = await blockchainService.unsubscribeFromTransaction(
        hash,
        userId,
      );

      expect(transactionsService.findOneByHash).toHaveBeenCalledWith(hash);

      expect(result).toBe(true);
    });
  });

  describe('unsubscribeFromAddress', () => {
    it('should unsubscribe from an address', async () => {
      // Mock the required dependencies and data
      const address = 'sample_address';
      const userId = new Types.ObjectId();
      const addressObj = {
        _id: new Types.ObjectId(),
        address: 'sample_address',
        counter: 0,
      };
      const subscription = {
        _id: new Types.ObjectId(),
        user: {
          _id: userId,
          name: 'sample_name',
          email: 'sample_email',
          passwordHash: 'sample_password_hash',
        },
        transaction: null,
        address: addressObj,
      };
      jest
        .spyOn(addressesService, 'findOneByAddress')
        .mockResolvedValue(addressObj);
      jest
        .spyOn(subscriptionsService, 'findOneByAddress')
        .mockResolvedValue(subscription);

      const result = await blockchainService.unsubscribeFromAddress(
        address,
        userId,
      );

      expect(addressesService.findOneByAddress).toHaveBeenCalledWith(address);

      expect(result).toBe(true);
    });
  });
});
