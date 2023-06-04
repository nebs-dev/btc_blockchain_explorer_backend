import {
  Body,
  Controller,
  Post,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginRequestDto } from './dto/auth-login-request.dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthRegisterResponseDto } from './dto/auth-register-response.dto';

@Controller('auth')
@SerializeOptions({
  excludePrefixes: ['_'],
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseInterceptors(MongooseClassSerializerInterceptor(AuthRegisterResponseDto))
  async register(
    @Body() data: AuthRegisterRequestDto,
  ): Promise<AuthRegisterResponseDto> {
    return await this.authService.register(data);
  }

  @Post('login')
  @UseInterceptors(MongooseClassSerializerInterceptor(AuthLoginResponseDto))
  async login(
    @Body() data: AuthLoginRequestDto,
  ): Promise<AuthLoginResponseDto> {
    return await this.authService.login(data);
  }
}
