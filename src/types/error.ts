import type { Address } from "viem";

export class MissingAddressError extends Error {
  constructor() {
    super("User address not found.");
  }
}

export class MissingChainIdError extends Error {
  constructor() {
    super("Chain ID not found.");
  }
}

export class ZeroAssetAmountError extends Error {
  constructor(asset: Address) {
    super(`Asset amount cannot be zero for address: ${asset}`);
  }
}

export class ZeroSharesAmountError extends Error {
  constructor(vault: Address) {
    super(`Shares amount cannot be zero for address: ${vault}`);
  }
}

export class ZeroMaxSharePriceError extends Error {
  constructor(vault: Address) {
    super(`Max share price cannot be zero for vault: ${vault}`);
  }
}

export class ChainIdMismatchError extends Error {
  constructor(clientChainId: number | undefined, argsChainId: number) {
    super(
      `Chain ID mismatch between client: ${clientChainId} and args: ${argsChainId}`,
    );
  }
}
