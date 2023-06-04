import { PickType } from '@nestjs/swagger';
import { User } from '../users.schema';

export class CreateUsersType extends PickType(User, [
  'email',
  'name',
  'passwordHash',
] as const) {}
