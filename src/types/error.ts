export class MorphoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MorphoError";
  }
}

export class MissingAddressError extends MorphoError {
  constructor() {
    super("User address not found.");
    this.name = "MissingAddressError";
  }
}

export class MissingChainIdError extends MorphoError {
  constructor() {
    super("Chain ID not found.");
    this.name = "MissingChainIdError";
  }
}
