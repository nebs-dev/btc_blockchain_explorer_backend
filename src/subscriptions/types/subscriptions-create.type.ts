import { Types } from 'mongoose';
import { Address } from '../../addresses/addresses.schema';
import { Transaction } from '../../transactions/transactions.schema';

export interface SubscriptionsCreateType {
  userId: Types.ObjectId;
  transaction?: Transaction;
  address?: Address;
}
