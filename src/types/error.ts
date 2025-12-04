import type { Address } from "viem";

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
