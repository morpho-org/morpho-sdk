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

export class MissingAccrualPositionError extends Error {
  constructor(market: string) {
    super(`Accrual position is missing for market: ${market}`);
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

export class NonPositiveBorrowAmountError extends Error {
  constructor(market: string) {
    super(`Borrow amount must be positive for market: ${market}`);
  }
}

export class ZeroCollateralAmountError extends Error {
  constructor(market: string) {
    super(
      `Total collateral amount must be positive for market: ${market}. Both amount and nativeAmount are zero.`,
    );
  }
}

export class NativeAmountOnNonWNativeCollateralError extends Error {
  constructor(collateralToken: Address, wNative: Address) {
    super(
      `Cannot use nativeAmount: collateral token ${collateralToken} is not the wrapped native token ${wNative}`,
    );
  }
}

export class BorrowExceedsSafeLtvError extends Error {
  constructor(borrowAmount: bigint, maxSafeBorrow: bigint) {
    super(
      `Borrow amount ${borrowAmount} exceeds safe maximum ${maxSafeBorrow} (LLTV minus buffer). Reduce borrow or increase collateral.`,
    );
  }
}

export class MissingMarketPriceError extends Error {
  constructor(market: string) {
    super(
      `Oracle price unavailable for market ${market}. Cannot validate position health.`,
    );
  }
}

export class AccrualPositionMarketMismatchError extends Error {
  constructor(positionMarketId: string, expectedMarketId: string) {
    super(
      `Accrual position market ${positionMarketId} does not match expected market ${expectedMarketId}`,
    );
  }
}

export class AccrualPositionUserMismatchError extends Error {
  constructor(positionUser: string, expectedUser: string) {
    super(
      `Accrual position user ${positionUser} does not match expected user ${expectedUser}`,
    );
  }
}

export class NegativeReallocationFeeError extends Error {
  constructor(vault: string) {
    super(`Reallocation fee must not be negative for vault: ${vault}`);
  }
}

export class EmptyReallocationWithdrawalsError extends Error {
  constructor(vault: string) {
    super(`Reallocation withdrawals list cannot be empty for vault: ${vault}`);
  }
}

export class NonPositiveReallocationAmountError extends Error {
  constructor(vault: string, market: string) {
    super(
      `Reallocation withdrawal amount must be positive for vault ${vault} on market ${market}`,
    );
  }
}

export class ReallocationWithdrawalOnTargetMarketError extends Error {
  constructor(vault: string, marketId: string) {
    super(
      `Reallocation withdrawal cannot include the borrow target market ${marketId} for vault ${vault}.`,
    );
  }
}

export class UnsortedReallocationWithdrawalsError extends Error {
  constructor(vault: string, marketId: string) {
    super(
      `Reallocation withdrawals must be strictly sorted by market ID for vault ${vault}. Market ${marketId} is out of order.`,
    );
  }
}
