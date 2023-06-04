import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Exclude()
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  @Exclude()
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
