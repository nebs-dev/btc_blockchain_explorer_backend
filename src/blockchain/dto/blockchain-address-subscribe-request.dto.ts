import { IsNotEmpty } from 'class-validator';

export class BlockchainAddressSubscribeRequestDto {
  @IsNotEmpty()
  address: string;
}
