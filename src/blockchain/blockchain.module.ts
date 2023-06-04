import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { HttpModule } from '@nestjs/axios';
import { EventsModule } from '../events/events.module';
import { ErrorsModule } from '../errors/errors.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    HttpModule,
    EventsModule,
    ErrorsModule,
    AddressesModule,
    TransactionsModule,
    SubscriptionsModule,
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
