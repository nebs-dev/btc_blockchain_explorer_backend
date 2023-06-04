import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Address } from '../addresses/addresses.schema';
import { Transaction } from '../transactions/transactions.schema';
import { User } from '../users/users.schema';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema()
export class Subscription {
  @Exclude()
  _id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  @Type(() => User)
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Address' })
  address: Address;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' })
  transaction: Transaction;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
