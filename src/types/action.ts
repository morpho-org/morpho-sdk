import { Address, Hex } from "viem";

export interface Transaction {
  to: Address;
  value: bigint;
  data: Hex;
}
