import { IsNotEmpty } from 'class-validator';

export class BlockchainTransactionInfoRequestDto {
  @IsNotEmpty()
  hash: string;
}
