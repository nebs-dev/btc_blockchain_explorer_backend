import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getApp } from './setup';
import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SubscriptionsService } from '../src/subscriptions/subscriptions.service';
import { Subscription } from '../src/subscriptions/subscriptions.schema';
import { Model, Types } from 'mongoose';
import { User } from '../src/users/users.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('SubscriptionsController', () => {
  let app: INestApplication;
  let subscriptionsService: SubscriptionsService;
  let usersService: UsersService;
  let authService: AuthService;
  let authToken = '';
  let userModel: Model<User>;

  beforeAll(async () => {
    app = getApp();
    await app.init();
    usersService = app.get<UsersService>(UsersService);
    authService = app.get<AuthService>(AuthService);
    subscriptionsService = app.get<SubscriptionsService>(SubscriptionsService);

    userModel = app.get<Model<User>>(getModelToken('User'));

    await usersService.create({
      name: 'Test',
      email: 'test789@gmail.com',
      passwordHash: bcrypt.hashSync('test123', 10),
    });

    const loginResponse = await authService.login({
      email: 'test789@gmail.com',
      password: 'test123',
    });

    authToken = loginResponse.authToken;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('GET /subscriptions', () => {
    it('should return an array of subscriptions for the authenticated user', async () => {
      const mockSubscriptions: Subscription[] = [
        {
          _id: new Types.ObjectId(),
          user: {
            _id: new Types.ObjectId(),
            email: 'test@gmail.com',
            name: 'Test',
            passwordHash: 'test123',
          },
          address: {
            _id: new Types.ObjectId(),
            address: '0x123',
            counter: 0,
          },
          transaction: null,
        },
      ];

      jest
        .spyOn(subscriptionsService, 'findAllByUserId')
        .mockResolvedValueOnce(mockSubscriptions);

      const response = await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toEqual(1);
      expect(response.body).toEqual([
        {
          user: {
            email: mockSubscriptions[0].user.email,
            name: mockSubscriptions[0].user.name,
          },
          address: {
            address: mockSubscriptions[0].address.address,
            counter: mockSubscriptions[0].address.counter,
          },
          transaction: null,
        },
      ]);
    });

    it('should return an error if retrieving subscriptions fails', async () => {
      jest
        .spyOn(subscriptionsService, 'findAllByUserId')
        .mockRejectedValueOnce(new Error('Failed to retrieve subscriptions'));

      const response = await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it('should return an empty array if the user has no subscriptions', async () => {
      const mockSubscriptions: Subscription[] = [];

      jest
        .spyOn(subscriptionsService, 'findAllByUserId')
        .mockResolvedValueOnce(mockSubscriptions);

      const response = await request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});
