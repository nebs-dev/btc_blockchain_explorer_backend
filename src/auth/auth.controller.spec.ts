import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLoginRequestDto } from './dto/auth-login-request.dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthRegisterResponseDto } from './dto/auth-register-response.dto';
import { getApp } from '../../test/setup';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeAll(async () => {
    const app = getApp();
    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);

    await app.init();
  });

  afterAll(async () => {
    const app = getApp();
    await app.close();
  });

  describe('register', () => {
    it('should register a new user and return the registration response', async () => {
      const registerRequest: AuthRegisterRequestDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };

      const registerResponse: AuthRegisterResponseDto = {
        email: 'test@example.com',
        name: 'Test User',
        authToken: 'token',
      };

      jest
        .spyOn(authService, 'register')
        .mockResolvedValueOnce(registerResponse);

      const result = await authController.register(registerRequest);

      expect(authService.register).toHaveBeenCalledWith(registerRequest);
      expect(result).toEqual(registerResponse);
    });
  });

  describe('login', () => {
    it('should authenticate user credentials and return the login response', async () => {
      const loginRequest: AuthLoginRequestDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const loginResponse: AuthLoginResponseDto = {
        name: 'Test User',
        email: 'test@gmail.com',
        authToken: 'token',
      };

      jest.spyOn(authService, 'login').mockResolvedValueOnce(loginResponse);

      const result = await authController.login(loginRequest);

      expect(authService.login).toHaveBeenCalledWith(loginRequest);
      expect(result).toEqual(loginResponse);
    });
  });
});
