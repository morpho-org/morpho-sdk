import type { Address, Client, Hex } from "viem";

export interface BaseAction<
  TType extends string = string,
  TArgs extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly type: TType;
  readonly args: TArgs;
}

export interface ERC20ApprovalAction
  extends BaseAction<"erc20Approval", { spender: Address; amount: bigint }> {}

export interface ERC20PermitAction {
  sign: (client: Client, userAddress: Address) => Promise<Hex>;
}

export interface VaultV2DepositAction
  extends BaseAction<
    "vaultV2Deposit",
    {
      vault: Address;
      assets: bigint;
      maxSharePrice: bigint;
      recipient: Address;
    }
  > {}

export interface VaultV2WithdrawAction
  extends BaseAction<
    "vaultV2Withdraw",
    {
      vault: Address;
      assets: bigint;
      recipient: Address;
    }
  > {}

export interface VaultV2RedeemAction
  extends BaseAction<
    "vaultV2Redeem",
    {
      vault: Address;
      shares: bigint;
      recipient: Address;
    }
  > {}

export type TransactionAction =
  | ERC20ApprovalAction
  | VaultV2DepositAction
  | VaultV2WithdrawAction
  | VaultV2RedeemAction;

export interface Transaction<TAction extends BaseAction = TransactionAction> {
  readonly to: Address;
  readonly value: bigint;
  readonly data: Hex;
  readonly action: TAction;
}

export interface PermitArgs {
  owner: Address;
  nonce: bigint;
  asset: Address;
  signature: Hex;
  amount: bigint;
  deadline: bigint;
}

export interface Permit2Args {
  owner: Address;
  nonce: bigint;
  asset: Address;
  signature: Hex;
  amount: bigint;
  deadline: bigint;
  expiration: bigint;
}

export interface Requirement {
  sign: (client: Client, userAddress: Address) => Promise<RequirementSignature>;
  action: PermitAction | Permit2Action;
}

export interface PermitAction
  extends BaseAction<"permit", { spender: Address; amount: bigint }> {}

export interface Permit2Action
  extends BaseAction<
    "permit2",
    { spender: Address; amount: bigint; expiration: bigint }
  > {}

export interface RequirementSignature {
  args: PermitArgs | Permit2Args;
  action: PermitAction | Permit2Action;
}

export function isRequirementApproval(
  requirement: Transaction<ERC20ApprovalAction> | Requirement | undefined,
): requirement is Transaction<ERC20ApprovalAction> {
  return (
    requirement !== undefined &&
    "to" in requirement &&
    "value" in requirement &&
    "data" in requirement
  );
}

export function isRequirementSignature(
  requirement: Transaction<ERC20ApprovalAction> | Requirement | undefined,
): requirement is Requirement {
  return (
    requirement !== undefined &&
    "sign" in requirement &&
    typeof requirement.sign === "function"
  );
}
