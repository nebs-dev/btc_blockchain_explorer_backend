import { IsNotEmpty } from 'class-validator';

export class BlockchainTransactionSubscribeRequestDto {
  @IsNotEmpty()
  hash: string;
}
