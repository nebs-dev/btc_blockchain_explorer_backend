import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthLoginResponseDto } from './dto/auth-login-response.dto';
import { AuthRegisterRequestDto } from './dto/auth-register-request.dto';
import { AuthLoginRequestDto } from './dto/auth-login-request.dto';
import { AuthRegisterResponseDto } from './dto/auth-register-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({
    email,
    password,
    name,
  }: AuthRegisterRequestDto): Promise<AuthRegisterResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await this.usersService.create({
      email,
      passwordHash,
      name,
    });

    // Generate the JWT token
    const authToken = this.jwtService.sign({ userId: newUser._id });

    // Create a new object with the user details and authToken
    const userDetails: AuthRegisterResponseDto = {
      name: newUser.name,
      email: newUser.email,
      authToken,
    };

    return userDetails;
  }

  async login({
    email,
    password,
  }: AuthLoginRequestDto): Promise<AuthLoginResponseDto> {
    // Check if the user exists
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate the password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate the JWT token
    const authToken = this.jwtService.sign({ userId: user._id });

    // Create a new object with the user details and authToken
    const userDetails: AuthLoginResponseDto = {
      name: user.name,
      email: user.email,
      authToken,
    };

    return userDetails;
  }
}
