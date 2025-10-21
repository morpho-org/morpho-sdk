import { Address, Hex } from "viem";

export interface Transaction {
  to: Address;
  value: bigint;
  data: Hex;
}

export interface VaultV2Actions {
  deposit: (params: { amount: bigint; recipient?: Address }) => Transaction;
}
