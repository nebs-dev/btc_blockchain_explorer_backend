import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './transactions.schema';
import { Model } from 'mongoose';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async findAll(): Promise<Transaction[]> {
    return await this.transactionModel
      .find()
      .sort({ counter: -1 })
      .limit(5)
      .lean();
  }

  async findOneByHash(hash: string): Promise<Transaction> {
    return await this.transactionModel.findOne({ hash }).lean();
  }

  async createOneOrIncreaseCounter(hash: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ hash });
    if (transaction) {
      transaction.counter++;
      return transaction.save();
    } else {
      const newTransaction = new this.transactionModel({
        hash,
      });
      return newTransaction.save();
    }
  }
}
