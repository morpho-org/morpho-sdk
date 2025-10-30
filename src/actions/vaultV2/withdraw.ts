import { Address, encodeFunctionData } from "viem";
import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { Transaction } from "../../types/action";

export interface VaultV2WithdrawParams {
  vault: Address;
  assets: bigint;
  recipient: Address;
  onBehalf: Address;
}

export function withdrawVaultV2({
  vault,
  assets,
  recipient,
  onBehalf,
}: VaultV2WithdrawParams): Transaction {
  return {
    to: vault,
    data: encodeFunctionData({
      abi: vaultV2Abi,
      functionName: "withdraw",
      args: [assets, recipient, onBehalf],
    }),
    value: 0n,
    action: {
      type: "vaultV2Withdraw",
      args: { vault, assets, recipient },
    },
  };
}
