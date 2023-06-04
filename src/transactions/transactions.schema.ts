import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  hash: string;

  @Prop({ required: true, default: 1 })
  counter: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
