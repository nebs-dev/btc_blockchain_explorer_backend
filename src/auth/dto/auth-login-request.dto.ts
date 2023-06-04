import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthLoginRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
