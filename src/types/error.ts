// Add context to your error: which args triggered the error? It is currently probably a nightmare to debug

export class MissingAddressError extends Error {
  constructor() {
    super("User address not found.");
    this.name = "MissingAddressError"; // This is useless, you can just access entity.constructor.name
  }
}

export class MissingChainIdError extends Error {
  constructor() {
    super("Chain ID not found.");
    this.name = "MissingChainIdError"; // This is useless, you can just access entity.constructor.name
  }
}

export class ZeroAssetAmountError extends Error {
  constructor() {
    super("Asset amount cannot be zero.");
    this.name = "ZeroAssetAmountError"; // This is useless, you can just access entity.constructor.name
  }
}

export class ZeroSharesAmountError extends Error {
  constructor() {
    super("Shares amount cannot be zero.");
    this.name = "ZeroSharesAmountError"; // This is useless, you can just access entity.constructor.name
  }
}

export class MaxSharePriceError extends Error {
  constructor() {
    super("Max share price cannot be zero.");
    this.name = "MaxSharePriceError"; // This is useless, you can just access entity.constructor.name
  }
}
