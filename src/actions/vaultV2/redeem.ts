import { Address, encodeFunctionData } from "viem";
import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { Transaction } from "../../types/action";

export interface VaultV2RedeemParams {
  vault: Address;
  shares: bigint;
  recipient: Address;
  onBehalf: Address;
}

export function redeemVaultV2({
  vault,
  shares,
  recipient,
  onBehalf,
}: VaultV2RedeemParams): Transaction {
  return {
    to: vault,
    data: encodeFunctionData({
      abi: vaultV2Abi,
      functionName: "redeem",
      args: [shares, recipient, onBehalf],
    }),
    value: 0n,
    action: {
      type: "vaultV2Redeem",
      args: { vault, shares, recipient },
    },
  };
}
