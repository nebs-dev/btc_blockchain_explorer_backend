import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from './addresses.schema';
import { AddressesController } from './addresses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
