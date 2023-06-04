import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getApp } from './setup';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import * as bcrypt from 'bcrypt';
import { TransactionsService } from '../src/transactions/transactions.service';
import { Transaction } from '../src/transactions/transactions.schema';
import { Model, Types } from 'mongoose';
import { User } from '../src/users/users.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('TransactionsController', () => {
  let app: INestApplication;
  let transactionsService: TransactionsService;
  let usersService: UsersService;
  let authService: AuthService;
  let authToken = '';
  let userModel: Model<User>;

  beforeAll(async () => {
    app = getApp();
    await app.init();
    usersService = app.get<UsersService>(UsersService);
    authService = app.get<AuthService>(AuthService);
    transactionsService = app.get<TransactionsService>(TransactionsService);

    userModel = app.get<Model<User>>(getModelToken('User'));

    await userModel.deleteMany({});

    await usersService.create({
      name: 'Test',
      email: 'test456@gmail.com',
      passwordHash: bcrypt.hashSync('test123', 10),
    });

    const loginResponse = await authService.login({
      email: 'test456@gmail.com',
      password: 'test123',
    });

    authToken = loginResponse.authToken;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('GET /transactions', () => {
    it('should return an array of transactions', async () => {
      const mockTransactions: Transaction[] = [
        {
          _id: new Types.ObjectId(),
          hash: 'transaction-hash-1',
          counter: 1,
        },
        {
          _id: new Types.ObjectId(),
          hash: 'transaction-hash-2',
          counter: 2,
        },
      ];

      jest
        .spyOn(transactionsService, 'findAll')
        .mockResolvedValueOnce(mockTransactions);

      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toEqual(2);
      expect(response.body).toEqual([
        {
          hash: mockTransactions[0].hash,
          counter: mockTransactions[0].counter,
        },
        {
          hash: mockTransactions[1].hash,
          counter: mockTransactions[1].counter,
        },
      ]);
    });

    it('should return an error if retrieving transactions fails', async () => {
      jest
        .spyOn(transactionsService, 'findAll')
        .mockRejectedValueOnce(new Error('Failed to retrieve transactions'));

      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
});
