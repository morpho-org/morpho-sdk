import type { Address, Hex } from "viem";

// Have them extend a BaseAction to ensure consistency

export interface ERC20ApprovalAction {
  type: "erc20Approval";
  args: {
    spender: Address;
    amount: bigint;
  };
}

export interface VaultV2DepositAction {
  type: "vaultV2Deposit";
  args: {
    vault: Address;
    assets: bigint;
    shares: bigint;
    recipient: Address;
  };
}
export interface VaultV2WithdrawAction {
  type: "vaultV2Withdraw";
  args: {
    vault: Address;
    assets: bigint;
    recipient: Address;
  };
}

export interface VaultV2RedeemAction {
  type: "vaultV2Redeem";
  args: {
    vault: Address;
    shares: bigint;
    recipient: Address;
  };
}

export type TransactionAction =
  | ERC20ApprovalAction
  | VaultV2DepositAction
  | VaultV2WithdrawAction
  | VaultV2RedeemAction;

export interface Transaction<T> {
  to: Address;
  value: bigint;
  data: Hex;
  action: T;
}
