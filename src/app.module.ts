import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import config from './config/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { EventsModule } from './events/events.module';
import { AddressesModule } from './addresses/addresses.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongooseModule.forRoot(config().db.uri),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
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
export class AppModule {}
