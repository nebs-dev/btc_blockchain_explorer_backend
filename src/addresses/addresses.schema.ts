import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema()
export class Address {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  address: string;

  @Prop({ required: true, default: 1 })
  counter: number;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
