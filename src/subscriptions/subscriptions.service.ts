import { Injectable } from '@nestjs/common';
import { Subscription, SubscriptionDocument } from './subscriptions.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SubscriptionsCreateType } from './types/subscriptions-create.type';
import { Address } from '../addresses/addresses.schema';
import { Transaction } from '../transactions/transactions.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async findOneByTransactionHash(
    transaction: Transaction,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({
        transaction,
      })
      .populate('user transaction');

    return subscription;
  }

  async findOneByAddress(address: Address): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({
        address,
      })
      .populate('user address');

    return subscription;
  }

  async createOne(data: SubscriptionsCreateType): Promise<Subscription> {
    const newSubscription = new this.subscriptionModel({
      user: data.userId,
      transaction: data.transaction,
      address: data.address,
    });

    newSubscription.save();

    return await this.subscriptionModel
      .findOne({
        _id: newSubscription._id,
      })
      .populate('transaction address user');
  }

  async findAllByUserId(userId: Types.ObjectId): Promise<Subscription[]> {
    const subscriptions = await this.subscriptionModel
      .find({
        user: userId,
      })
      .populate('transaction address user')
      .lean();

    return subscriptions;
  }

  async deleteOneByTransactionIdAndUserId(
    transactionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.subscriptionModel.deleteOne({
      transaction: transactionId,
      user: userId,
    });
  }

  async deleteOneByAddressIdAndUserId(
    addressId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.subscriptionModel.deleteOne({
      address: addressId,
      user: userId,
    });
  }
}
