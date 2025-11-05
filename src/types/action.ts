import type { Address, Hex } from "viem";

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

export interface Transaction {
  to: Address;
  value: bigint;
  data: Hex;
  action:
    | ERC20ApprovalAction
    | VaultV2DepositAction
    | VaultV2WithdrawAction
    | VaultV2RedeemAction;
}
