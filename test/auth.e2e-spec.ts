import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '../src/users/users.service';
import { AuthRegisterRequestDto } from '../src/auth/dto/auth-register-request.dto';
import { AuthRegisterResponseDto } from '../src/auth/dto/auth-register-response.dto';
import { getApp } from './setup';
import { Model } from 'mongoose';
import { User } from '../src/users/users.schema';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userModel: Model<User>;

  beforeAll(async () => {
    app = getApp();
    await app.init();
    userModel = app.get<Model<User>>(getModelToken('User'));

    usersService = app.get(UsersService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await userModel.deleteMany({});
  });

  beforeEach(async () => {
    // Drop the collections in the test database before each test case
    await userModel.deleteMany({});
  });

  it('/auth/register (POST)', async () => {
    const registerDto = {
      email: 'test@gmail.com',
      name: 'Test',
      password: 'test123',
    } as AuthRegisterRequestDto;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    const responseBody = response.body as AuthRegisterResponseDto;

    expect(responseBody).toHaveProperty('name');
    expect(responseBody).toHaveProperty('email');
    expect(responseBody).toHaveProperty('authToken');
  });

  it('/auth/login (POST)', async () => {
    const password = 'test123';

    // Mock a user in the test database
    const mockUser = {
      email: 'test@gmail.com',
      name: 'Test',
      passwordHash: await bcrypt.hash(password, 10),
    };

    await usersService.create(mockUser);

    // Make a login request with the mock user
    const loginDto = {
      email: mockUser.email,
      password,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(201);

    // Assert the response as needed
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('authToken');
  });

  it('returns 401 Unauthorized if login credentials are incorrect', async () => {
    // Create a user in the test database
    const mockUser = {
      email: 'test@gmail.com',
      name: 'Test',
      passwordHash: await bcrypt.hash('test123', 10),
    };

    await usersService.create(mockUser);

    // Make a login request with incorrect credentials
    const loginDto = {
      email: 'test@gmail.com',
      password: 'incorrectPassword',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(401);

    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid credentials',
      statusCode: 401,
    });
  });

  it('returns 401 Unauthorized if login email does not exist', async () => {
    // Make a login request with non-existent email
    const loginDto = {
      email: 'nonexistent@gmail.com',
      password: 'test123',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(401);

    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Invalid credentials',
      statusCode: 401,
    });
  });

  it('returns 400 Bad Request if required fields are missing in registration', async () => {
    // Make a registration request with missing fields
    const registerDto = {
      email: 'test@gmail.com',
      // Missing 'name' and 'password' fields
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(400);

    // Assert the response as needed
    expect(response.body).toEqual({
      statusCode: 400,
      message: ['name should not be empty', 'password should not be empty'],
      error: 'Bad Request',
    });
  });

  it('returns 400 Bad Request if email is already registered', async () => {
    const password = 'existing123';

    // Create a user in the test database
    const existingUser = {
      email: 'existing@gmail.com',
      name: 'Existing',
      passwordHash: bcrypt.hashSync(password, 10),
    };

    await usersService.create(existingUser);

    // Make a registration request with the existing email
    const registerDto = {
      email: existingUser.email,
      name: 'Test',
      password: 'test123',
    } as AuthRegisterRequestDto;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: 'User already exists',
      error: 'Bad Request',
    });
  });
});
