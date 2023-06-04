import { PickType } from '@nestjs/swagger';
import { Subscription } from 'src/subscriptions/subscriptions.schema';

export class BlockchainTransactionSubscribeResponseDto extends PickType(
  Subscription,
  ['transaction', 'user'],
) {}
