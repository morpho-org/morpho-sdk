export interface Metadata {
  origin: string;
  // The timestamp is set at morpho client instanciation? Seems a bit early while it's going to be pushed to the tx calldata.
  // IMO metadata should be asked as optional in all morpho actions, such as vaultV2 deposit/withdraw actions.
  timestamp?: boolean;
}
