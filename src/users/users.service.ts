import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { CreateUsersType } from './type/create-users-type';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create({ email, passwordHash, name }: CreateUsersType): Promise<User> {
    const newUser = new this.userModel({
      email,
      passwordHash,
      name,
    });
    return newUser.save();
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }
}
