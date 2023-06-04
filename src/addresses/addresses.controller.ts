import {
  Controller,
  Get,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { Address } from './addresses.schema';
import { AddressesService } from './addresses.service';
import { ErrorType } from '../errors/types/error-request.type';

@Controller('addresses')
@SerializeOptions({
  excludePrefixes: ['_'],
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @UseInterceptors(MongooseClassSerializerInterceptor(Address))
  async addresses(): Promise<Address[] | ErrorType> {
    return await this.addressesService.findAll();
  }
}
