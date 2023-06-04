import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressesModule } from '../src/addresses/addresses.module';
import { AuthModule } from '../src/auth/auth.module';
import { BlockchainModule } from '../src/blockchain/blockchain.module';
import config from '../src/config/config';
import { EventsModule } from '../src/events/events.module';
import { SubscriptionsModule } from '../src/subscriptions/subscriptions.module';
import { TransactionsModule } from '../src/transactions/transactions.module';
import { UsersModule } from '../src/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    MongooseModule.forRoot(config().test_db.uri),
    UsersModule,
    AuthModule,
    BlockchainModule,
    EventsModule,
    AddressesModule,
    TransactionsModule,
    SubscriptionsModule,
  ],
  controllers: [],
  providers: [],
})
export class TestAppModule {}
