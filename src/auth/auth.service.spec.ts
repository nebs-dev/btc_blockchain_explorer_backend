import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import { Types } from 'mongoose';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { AuthRegisterResponseDto } from './dto/auth-register-response.dto';
import { AuthLoginRequestDto } from './dto/auth-login-request.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { getApp } from '../../test/setup';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const app = getApp();
    authService = app.get<AuthService>(AuthService);
    usersService = app.get<UsersService>(UsersService);
    jwtService = app.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return the registration response', async () => {
      const registerRequest: AuthRegisterRequestDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      const existingUser = null;
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValueOnce(existingUser);

      const passwordHash = 'hashed_password';
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce(passwordHash);

      const newUser = {
        _id: new Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        passwordHash,
      };
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(newUser);

      const authToken = 'token';
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(authToken);

      const expectedResponse: AuthRegisterResponseDto = {
        name: 'Test User',
        email: 'test@example.com',
        authToken,
      };

      const result = await authService.register(registerRequest);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash,
        name: 'Test User',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: newUser._id });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw BadRequestException when user already exists', async () => {
      const registerRequest: AuthRegisterRequestDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      const existingUser = {
        _id: new Types.ObjectId(),
        name: 'Test User',
        email: 'testing@gmail.com',
        passwordHash: 'hashed_password',
      };
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValueOnce(existingUser);

      await expect(authService.register(registerRequest)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    it('should authenticate user credentials and return the login response', async () => {
      const loginRequest: AuthLoginRequestDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        _id: new Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(user);

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const authToken = 'token';
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce(authToken);

      const expectedResponse: AuthLoginResponseDto = {
        name: 'Test User',
        email: 'test@example.com',
        authToken,
      };

      const result = await authService.login(loginRequest);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed_password',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: user._id });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const loginRequest: AuthLoginRequestDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.login(loginRequest)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginRequest: AuthLoginRequestDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = {
        _id: new Types.ObjectId(),
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(user);

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(authService.login(loginRequest)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed_password',
      );
    });
  });
});
