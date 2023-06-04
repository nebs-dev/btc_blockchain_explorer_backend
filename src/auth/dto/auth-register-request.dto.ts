import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthRegisterRequestDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;
}
