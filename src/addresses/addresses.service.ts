import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Address } from './addresses.schema';
import { Model } from 'mongoose';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<Address>,
  ) {}

  async findAll(): Promise<Address[]> {
    return await this.addressModel.find().sort({ counter: -1 }).limit(5).lean();
  }

  async findOneByAddress(address: string): Promise<Address> {
    return await this.addressModel.findOne({ address }).lean();
  }

  async createOneOrIncreaseCounter(address: string): Promise<Address> {
    const addressObj = await this.addressModel.findOne({ address });
    if (addressObj) {
      addressObj.counter++;
      return addressObj.save();
    } else {
      const newAddress = new this.addressModel({
        address,
      });
      return newAddress.save();
    }
  }
}
