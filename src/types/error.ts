import type { Address } from "viem";

export class NonPositiveAssetAmountError extends Error {
  constructor(origin: Address) {
    super(`Asset amount must be positive for address ${origin}`);
  }
}

export class NonPositiveSharesAmountError extends Error {
  constructor(vault: Address) {
    super(`Shares amount must be positive for address: ${vault}`);
  }
}

export class NonPositiveMaxSharePriceError extends Error {
  constructor(vault: Address) {
    super(`Max share price must be positive for vault: ${vault}`);
  }
}

export class AddressMismatchError extends Error {
  constructor(clientAddress: Address, argsAddress: Address) {
    super(
      `Address mismatch between client: ${clientAddress} and args: ${argsAddress}`,
    );
  }
}

export class ChainIdMismatchError extends Error {
  constructor(clientChainId: number | undefined, argsChainId: number) {
    super(
      `Chain ID mismatch between client: ${clientChainId} and args: ${argsChainId}`,
    );
  }
}

export class MissingClientPropertyError extends Error {
  constructor(property: string) {
    super(`A required ${property} is missing from the client.`);
  }
}

export class ApprovalAmountLessThanSpendAmountError extends Error {
  constructor() {
    super("Approval amount is less than spend amount");
  }
}

export class NegativeSlippageToleranceError extends Error {
  constructor(slippageTolerance: bigint) {
    super(`Slippage tolerance ${slippageTolerance} must not be negative`);
  }
}

export class ExcessiveSlippageToleranceError extends Error {
  constructor(slippageTolerance: bigint) {
    super(
      `Slippage tolerance ${slippageTolerance} exceeds maximum allowed (10%)`,
    );
  }
}

export class EmptyDeallocationsError extends Error {
  constructor(vault: Address) {
    super(`Deallocations list cannot be empty for vault: ${vault}`);
  }
}

export class DepositAmountMismatchError extends Error {
  constructor(depositAmount: bigint, signatureAmount: bigint) {
    super(
      `Deposit amount ${depositAmount} does not match requirement signature amount ${signatureAmount}`,
    );
  }
}

export class DepositAssetMismatchError extends Error {
  constructor(depositAsset: Address, signatureAsset: Address) {
    super(
      `Deposit asset ${depositAsset} does not match requirement signature asset ${signatureAsset}`,
    );
  }
}

export class DeallocationsExceedWithdrawError extends Error {
  constructor(
    vault: Address,
    withdrawAmount: bigint,
    totalDeallocated: bigint,
  ) {
    super(
      `Total deallocated amount (${totalDeallocated}) exceed withdraw amount (${withdrawAmount}) for vault: ${vault}`,
    );
  }
}

export class NativeAmountOnNonWNativeVaultError extends Error {
  constructor(vaultAsset: Address, wNative: Address) {
    super(
      `Cannot use nativeAmount: vault asset ${vaultAsset} is not the wrapped native token ${wNative}`,
    );
  }
}

export class ChainWNativeMissingError extends Error {
  constructor(chainId: number) {
    super(
      `Chain ${chainId} does not have a configured wrapped native token (wNative)`,
    );
  }
}

export class NegativeNativeAmountError extends Error {
  constructor(nativeAmount: bigint) {
    super(`Native amount must not be negative, got ${nativeAmount}`);
  }
}

export class ZeroDepositAmountError extends Error {
  constructor(vault: Address) {
    super(
      `Total deposit amount must be positive for vault: ${vault}. Both amount and nativeAmount are zero.`,
    );
  }
}

export class VaultAddressMismatchError extends Error {
  constructor(vaultAddress: Address, argsVaultAddress: Address) {
    super(
      `Vault address mismatch between vault: ${vaultAddress} and args: ${argsVaultAddress}`,
    );
  }
}
