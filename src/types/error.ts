export class MissingAddressError extends Error {
  constructor() {
    super("User address not found.");
    this.name = "MissingAddressError";
  }
}

export class MissingChainIdError extends Error {
  constructor() {
    super("Chain ID not found.");
    this.name = "MissingChainIdError";
  }
}

export class ZeroAssetAmountError extends Error {
  constructor() {
    super("Asset amount cannot be zero.");
    this.name = "ZeroAssetAmountError";
  }
}

export class ZeroSharesAmountError extends Error {
  constructor() {
    super("Shares amount cannot be zero.");
    this.name = "ZeroSharesAmountError";
  }
}

export class ZeroMaxSharePriceError extends Error {
  constructor() {
    super("Max share price cannot be zero.");
    this.name = "ZeroMaxSharePriceError";
  }
}
