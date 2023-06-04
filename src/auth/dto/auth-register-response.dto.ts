import { PickType } from '@nestjs/swagger';
import { User } from '../../users/users.schema';

export class AuthRegisterResponseDto extends PickType(User, ['name', 'email']) {
  authToken: string;
}
