import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Model, Types } from 'mongoose';
import { TransactionInfoType } from '../src/blockchain/types/transaction-info.type';
import { AddressInfoType } from '../src/blockchain/types/address-info.type';
import { BlockchainService } from '../src/blockchain/blockchain.service';
import { getApp } from './setup';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/users.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('BlockchainController', () => {
  let app: INestApplication;
  let blockchainService: BlockchainService;
  let usersService: UsersService;
  let authService: AuthService;
  let authToken = '';
  let userModel: Model<User>;

  beforeAll(async () => {
    app = getApp();
    await app.init();
    blockchainService = app.get<BlockchainService>(BlockchainService);
    usersService = app.get<UsersService>(UsersService);
    authService = app.get<AuthService>(AuthService);

    userModel = app.get<Model<User>>(getModelToken('User'));
    await userModel.deleteMany({});

    await usersService.create({
      name: 'Test',
      email: 'test666@gmail.com',
      passwordHash: bcrypt.hashSync('test123', 10),
    });

    const loginResponse = await authService.login({
      email: 'test666@gmail.com',
      password: 'test123',
    });

    authToken = loginResponse.authToken;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('GET /blockchain/address', () => {
    it('should return address info and create or increase counter', async () => {
      const mockAddress = 'mock-address';
      const mockAddressInfo: AddressInfoType = {
        address: mockAddress,
        total_received: 100,
        total_sent: 50,
        balance: 50,
        unconfirmed_balance: 0,
        final_balance: 50,
        n_tx: 5,
        unconfirmed_n_tx: 0,
        final_n_tx: 5,
      };

      // Mock the blockchainService.getAddressBlockchainInfo() method
      jest
        .spyOn(blockchainService, 'getAddressBlockchainInfo')
        .mockResolvedValueOnce(mockAddressInfo);

      // Send a GET request to the endpoint
      const response = await request(app.getHttpServer())
        .get(`/blockchain/address?address=${mockAddress}`)
        .expect(200);

      // Assert the response body
      expect(response.body).toEqual(mockAddressInfo);
    });

    it('should handle errors and return an error response', async () => {
      const mockAddress = 'mock-address';

      // Mock the blockchainService.getAddressBlockchainInfo() method to throw an error
      jest
        .spyOn(blockchainService, 'getAddressBlockchainInfo')
        .mockRejectedValueOnce(new Error('Error retrieving address info'));

      // Send a GET request to the endpoint
      const response = await request(app.getHttpServer())
        .get(`/blockchain/address?address=${mockAddress}`)
        .expect(500);

      // Assert the response body
      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('GET /blockchain/transaction', () => {
    it('should return transaction info and create or increase counter', async () => {
      const mockTransactionId = 'mock-transaction-id';
      const mockTransactionInfo: TransactionInfoType = {
        block_hash: 'block-hash',
        block_height: 1,
        block_index: 0,
        hash: mockTransactionId,
        addresses: ['address1', 'address2'],
        total: 10,
        fees: 1,
        size: 100,
        preference: 'low',
        relayed_by: 'node1',
        confirmed: '2023-01-01',
        received: '2023-01-01',
        ver: 1,
        double_spend: false,
        vin_sz: 1,
        vout_sz: 2,
        confirmations: 1,
        confidence: 0.8,
        inputs: [
          {
            prev_hash: 'prev-hash',
            output_index: 0,
            output_value: 5,
            address: 'address1',
            script: 'script1',
            script_type: 'script-type1',
            age: 10,
          },
        ],
        outputs: [
          {
            value: 5,
            script: 'script2',
            addresses: ['address2'],
            script_type: 'script-type2',
          },
          {
            value: 5,
            script: 'script3',
            addresses: ['address3'],
            script_type: 'script-type3',
          },
        ],
      };

      // Mock the blockchainService.getTransactionBlockchainInfo() method
      jest
        .spyOn(blockchainService, 'getTransactionBlockchainInfo')
        .mockResolvedValueOnce(mockTransactionInfo);

      // Send a GET request to the endpoint
      const response = await request(app.getHttpServer())
        .get(`/blockchain/transaction?hash=${mockTransactionId}`)
        .expect(200);

      // Assert the response body
      expect(response.body).toEqual(mockTransactionInfo);
    });

    it('should handle errors and return an error response', async () => {
      const mockTransactionId = 'mock-transaction-id';

      // Mock the blockchainService.getTransactionBlockchainInfo() method to throw an error
      jest
        .spyOn(blockchainService, 'getTransactionBlockchainInfo')
        .mockRejectedValueOnce(new Error('Error retrieving transaction info'));

      // Send a GET request to the endpoint
      const response = await request(app.getHttpServer())
        .get(`/blockchain/transaction?hash=${mockTransactionId}`)
        .expect(500);

      // Assert the response body
      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('POST /blockchain/transaction/subscribe', () => {
    it('should subscribe to a transaction and return the subscription', async () => {
      const mockHash = 'mock-transaction-hash';
      const mockUserId = new Types.ObjectId().toHexString();
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@gmail.com',
        passwordHash: 'password-hash',
        name: 'Test',
      };
      const mockSubscription = {
        _id: new Types.ObjectId(),
        user: mockUser,
        transaction: {
          _id: new Types.ObjectId(),
          hash: mockHash,
          counter: 1,
        },
        address: null,
      };

      // Mock the blockchainService.subscribeToTransaction() method
      jest
        .spyOn(blockchainService, 'subscribeToTransaction')
        .mockResolvedValueOnce(mockSubscription);

      // Send a POST request to the endpoint
      const response = await request(app.getHttpServer())
        .post('/blockchain/transaction/subscribe')
        .send({ hash: mockHash })
        .set('Authorization', `Bearer ${authToken}`)
        .set('userId', mockUserId)
        .expect(201);

      // Assert the response body
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('transaction');
      expect(response.body).toHaveProperty('address');
      expect(response.body.user).toEqual({
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(response.body.transaction).toEqual({
        hash: mockHash,
        counter: 1,
      });
      expect(response.body.address).toBeNull();
    });

    it('should handle errors and return an error response', async () => {
      const mockHash = 'mock-transaction-hash';
      const mockUserId = new Types.ObjectId().toHexString();

      // Mock the blockchainService.subscribeToTransaction() method to throw an error
      jest
        .spyOn(blockchainService, 'subscribeToTransaction')
        .mockRejectedValueOnce(new Error('Error subscribing to transaction'));

      // Send a POST request to the endpoint
      const response = await request(app.getHttpServer())
        .post('/blockchain/transaction/subscribe')
        .send({ hash: mockHash })
        .set('Authorization', `Bearer ${authToken}`)
        .set('userId', mockUserId)
        .expect(500);

      // Assert the response body
      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
});
