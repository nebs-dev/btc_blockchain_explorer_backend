import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './subscriptions.schema';
import { TransactionsModule } from '../transactions/transactions.module';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    TransactionsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
