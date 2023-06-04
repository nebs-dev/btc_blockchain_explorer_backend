export interface TransactionInfoType {
  block_hash: string;
  block_height: number;
  block_index: number;
  hash: string;
  addresses: string[];
  total: number;
  fees: number;
  size: number;
  preference: string;
  relayed_by: string;
  confirmed: string;
  received: string;
  ver: number;
  double_spend: boolean;
  vin_sz: number;
  vout_sz: number;
  confirmations: number;
  confidence: number;
  inputs: {
    prev_hash: string;
    output_index: number;
    output_value: number;
    address: string;
    script: string;
    script_type: string;
    age: number;
  }[];
  outputs: {
    value: number;
    script: string;
    addresses: string[];
    script_type: string;
  }[];
}
