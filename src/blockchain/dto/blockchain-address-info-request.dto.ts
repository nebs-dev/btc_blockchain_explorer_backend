import { IsNotEmpty } from 'class-validator';

export class BlockchainAddressInfoRequestDto {
  @IsNotEmpty()
  address: string;
}
