import { PickType } from '@nestjs/swagger';
import { Subscription } from 'src/subscriptions/subscriptions.schema';

export class BlockchainAddressSubscribeResponseDto extends PickType(
  Subscription,
  ['address', 'user'],
) {}
